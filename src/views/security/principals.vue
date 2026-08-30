<template>
  <div class="app-container">
    <div class="page-title">Principals</div>
    <el-row>
      <el-button-group>
        <el-button type="primary" :icon="Plus" :disabled="!canSet" @click="btnClick('new')">New</el-button>
        <el-button
          type="success" :disabled="!isSelected || !canSet"
          @click="btnClick('update')"
        >
          <i class="iconfont icon-role" style="margin-right: 4px;" />Edit
        </el-button>
        <el-button type="danger" :icon="Delete" :disabled="!isSelected || !canDelete" @click="delPrincipal()">Delete</el-button>
      </el-button-group>
    </el-row>
    <el-row>
      <el-table
        ref="principalTable" :key="tableKey" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        style="width: 100%" height="100%" class="fix-table" highlight-current-row @current-change="currentRowChange"
      >
        <el-table-column label="Principal" min-width="220">
          <template #default="scope">{{ scope.row.display_name || scope.row.principal_id }}</template>
        </el-table-column>

        <el-table-column label="Kind" width="100">
          <template #default="scope">{{ scope.row.kind }}</template>
        </el-table-column>

        <el-table-column class-name="status-col" label="Status" width="110">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Email" min-width="160">
          <template #default="scope">{{ scope.row.email }}</template>
        </el-table-column>

        <el-table-column label="Exec user" width="140">
          <template #default="scope">{{ scope.row.execution_user }}</template>
        </el-table-column>

        <el-table-column label="Roles">
          <template #default="scope">
            <el-tag v-for="(role, index) in scope.row.roles" :key="index" type="info" style="margin:0px 5px 5px 0px;">
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <!--
      Principal overlay editor. Identities live in the authentication service
      (Dex); the engine only stores an authorization overlay per principal:
      status / execution_user / roles. "New" registers an overlay for a not yet
      seen (issuer, subject) pair — the backend requires the principal_id to be
      the stable id derived from issuer + subject, which we compute the same way.
    -->
    <el-drawer v-model="formVisible" custom-class="right-drawer" size="50%">
      <template #header>
        <span>{{ formMode === 'new' ? 'Add principal overlay' : 'Update principal overlay' }}</span>
      </template>
      <el-card shadow="never" class="register-card">
        <el-form ref="principalFormDom" :model="principalForm" :rules="formRules" label-width="140px">
          <el-form-item v-if="formMode === 'new'" label="Issuer" prop="issuer">
            <el-input v-model="principalForm.issuer" placeholder="OIDC issuer URL" />
          </el-form-item>
          <el-form-item v-if="formMode === 'new'" label="Subject" prop="subject">
            <el-input v-model="principalForm.subject" placeholder="Subject claim ('sub') of the identity" />
          </el-form-item>
          <el-form-item v-if="formMode === 'new'" label="Kind" prop="kind">
            <el-select v-model="principalForm.kind">
              <el-option label="user" value="user" />
              <el-option label="service" value="service" />
            </el-select>
          </el-form-item>
          <el-form-item label="Status" prop="status">
            <el-select v-model="principalForm.status">
              <el-option label="active" value="active" />
              <el-option label="disabled" value="disabled" />
            </el-select>
          </el-form-item>
          <el-form-item label="Execution user" prop="execution_user">
            <el-input v-model="principalForm.execution_user" placeholder="OS user the apps of this principal run as" />
          </el-form-item>
          <el-form-item label="Roles" prop="roles">
            <el-select v-model="principalForm.roles" multiple filterable placeholder="Roles bound to this principal">
              <el-option v-for="role in roleOptions" :key="role" :label="role" :value="role" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="formMode === 'new' && principalForm.principal_id" label="Principal ID">
            <span style="word-break: break-all;">{{ principalForm.principal_id }}</span>
          </el-form-item>
        </el-form>
      </el-card>
      <div class="dialog-footer">
        <el-button @click="formVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="savePrincipal()">Save</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { getClient } from "@/utils/appmeshClient";
import { computePrincipalId, getAuthConfig } from "@/utils/oidc";
import { ElMessageBox, ElMessage } from "element-plus";
import { markRaw } from "vue";
import { Plus, Delete } from "@element-plus/icons-vue";

export default {
  name: "Principals",
  data() {
    return {
      Plus: markRaw(Plus), Delete: markRaw(Delete),
      tableKey: 0,
      isSelected: false,
      list: [],
      listLoading: false,
      saving: false,

      currentRow: null,
      formVisible: false,
      formMode: "update", // new | update
      roleOptions: [],
      principalForm: {
        issuer: "",
        subject: "",
        kind: "user",
        status: "active",
        execution_user: "",
        roles: [],
        principal_id: "",
      },
      formRules: {
        issuer: [{ required: true, message: "Issuer is required", trigger: "blur" }],
        subject: [{ required: true, message: "Subject is required", trigger: "blur" }],
      },
    };
  },
  computed: {
    canSet() {
      return this.$store.getters.user?.permissions?.includes("principal-set");
    },
    canDelete() {
      return this.$store.getters.user?.permissions?.includes("principal-delete");
    },
  },
  watch: {
    // The backend derives the principal id from issuer + subject; show it live
    // so the operator sees the exact overlay that will be created.
    "principalForm.issuer": "updatePrincipalId",
    "principalForm.subject": "updatePrincipalId",
  },
  mounted() {
    this.refreshData();
    this.loadRoles();
  },
  methods: {
    statusTagType(status) {
      if (status === "active") return "success";
      if (status === "disabled") return "danger";
      return "info"; // tombstoned
    },
    async updatePrincipalId() {
      if (this.formMode !== "new") return;
      const { issuer, subject } = this.principalForm;
      this.principalForm.principal_id =
        issuer && subject ? await computePrincipalId(issuer.trim(), subject.trim()) : "";
    },
    loadRoles() {
      getClient()
        .list_roles()
        .then((res) => {
          this.roleOptions = Object.keys(res || {});
        })
        .catch(() => {});
    },
    refreshData() {
      const selectedId = this.currentRow ? this.currentRow.principal_id : null;
      this.listLoading = true;
      this.list = [];
      getClient()
        .list_principals()
        .then(
          (res) => {
            if (res) {
              for (const id in res) {
                this.list.push({
                  principal_id: id,
                  kind: res[id].kind,
                  issuer: res[id].issuer,
                  subject: res[id].subject,
                  display_name: res[id].display_name,
                  email: res[id].email,
                  status: res[id].status,
                  execution_user: res[id].execution_user,
                  roles: res[id].roles || [],
                });
              }
            }
            this.listLoading = false;
            // restore previous selection
            if (selectedId && this.$refs.principalTable) {
              const row = this.list.find((r) => r.principal_id === selectedId);
              if (row) {
                this.$nextTick(() => {
                  this.$refs.principalTable.setCurrentRow(row);
                });
              }
            }
          },
          () => {
            this.listLoading = false;
          }
        )
        .catch((err) => {
          console.warn(err);
          this.listLoading = false;
        });
    },
    async btnClick(action) {
      switch (action) {
        case "new": {
          this.formMode = "new";
          let issuer = "";
          try {
            issuer = (await getAuthConfig()).issuer;
          } catch {
            /* operator types it manually */
          }
          this.principalForm = {
            issuer,
            subject: "",
            kind: "user",
            status: "active",
            execution_user: "",
            roles: [],
            principal_id: "",
          };
          this.formVisible = true;
          return;
        }
        case "update": {
          this.formMode = "update";
          const row = this.currentRow;
          this.principalForm = {
            issuer: row.issuer,
            subject: row.subject,
            kind: row.kind,
            status: row.status,
            execution_user: row.execution_user || "",
            roles: [...row.roles],
            principal_id: row.principal_id,
          };
          this.formVisible = true;
          return;
        }
      }
    },
    savePrincipal() {
      this.$refs.principalFormDom.validate(async (valid) => {
        if (!valid) return;
        this.saving = true;
        try {
          const form = this.principalForm;
          let principalId = form.principal_id;
          const policy = {
            status: form.status,
            execution_user: form.execution_user,
            roles: form.roles,
          };
          if (this.formMode === "new") {
            principalId = await computePrincipalId(form.issuer.trim(), form.subject.trim());
            // Creation requires the full identity in the body; the id must be
            // the stable id derived from issuer + subject.
            await getClient().update_principal(principalId, {
              kind: form.kind,
              issuer: form.issuer.trim(),
              subject: form.subject.trim(),
              ...policy,
            });
          } else {
            await getClient().update_principal(principalId, policy);
          }
          ElMessage.success(`Principal ${principalId} saved.`);
          this.formVisible = false;
          this.refreshData();
        } catch (error) {
          console.warn(error); // onError already showed the toast
        } finally {
          this.saving = false;
        }
      });
    },
    delPrincipal() {
      const row = this.currentRow;
      ElMessageBox.confirm(
        `Do you want to delete the authorization overlay of <${row.display_name || row.principal_id}>?` +
          " The identity itself stays in the authentication service.",
        "Tooltip",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      ).then(() => {
        this.listLoading = true;
        getClient()
          .delete_principal(row.principal_id)
          .then(
            () => {
              ElMessage.success("Principal " + row.principal_id + " deleted.");
              this.refreshData();
            },
            () => {
              this.listLoading = false;
            }
          )
          .catch((err) => {
            console.warn(err);
            this.listLoading = false;
          });
      });
    },
    currentRowChange(currentRow) {
      this.currentRow = currentRow;
      this.isSelected = !!currentRow;
    },
  },
};
</script>

<style scoped>
.el-table th.gutter {
  display: table-cell !important;
}

.el-row {
  margin-bottom: 8px;
}

/* Flex-fill: app-main is a flex column, so this page flexes to fill the
   content area; the table row then flexes to fill what's left below the
   title/toolbar. No pixel heights -> can't overflow or leave a bottom gap. */
.app-container {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.app-container > .el-row:last-child {
  flex: 1 1 auto;
  min-height: 0;
  margin-bottom: 0;
}

:deep(.fix-table) {
  height: 100% !important;
}

.register-card {
  height: calc(100vh - 136px) !important;
  overflow-y: auto;
}

.right-drawer .dialog-footer {
  border-top: 1px solid #bfcbd9;
  background-color: #ffffff;
  width: 100%;
  position: absolute;
  bottom: 0px;
  text-align: right;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-right: 30px;
}
</style>
