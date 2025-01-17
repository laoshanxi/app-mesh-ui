<template>
  <div class="app-container" style="clear:both;" v-loading="loading">
    <el-row>
      <el-col :span="24">
        <el-tabs type="border-card">
          <el-tab-pane style="minWidth:600px;">
            <span slot="label">
              <i class="el-icon-key"></i> Change Password
            </span>
            <el-form ref="form" :model="form" label-width="200px">
              <el-form-item label="New Password" prop="newPwd" :rules="{
                required: true, message: 'New Password is empty', trigger: 'blur'
              }">
                <el-input type="Password" v-model="form.newPwd"></el-input>
              </el-form-item>
              <el-form-item label="Confirm Password" prop="confirmPwd" :rules="{
                required: true, validator: validatePass2, trigger: 'blur'
              }">
                <el-input type="Password" v-model="form.confirmPwd"></el-input>
              </el-form-item>

              <el-form-item>
                <el-button size="small" type="primary" @click.prevent="updatePwd()">Submit</el-button>
                <el-button size="small" @click.prevent="reset()">Reset</el-button>
              </el-form-item>

              <el-form-item label="MFA enabled" prop="mfaEnabled">
                <el-switch v-model="form.mfaEnabled" active-text="Yes" :active-value="true" inactive-text="No"
                  :inactive-value="false" @change="handleMfaChange" />
              </el-form-item>

            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <el-dialog title="Setup MFA" :visible.sync="qrDialogVisible" width="30%">
      <div v-if="qrCodeData" class="text-center">
        <qrcode :value="qrCodeData" :options="{ width: 200 }"></qrcode>
        <el-input v-model="totpCode" placeholder="Enter TOTP code" style="margin-top: 20px"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="qrDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="verifyTotp">Verify</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { updatePwd, userSelf, getTotpSecret, setupTotp, disableTotp } from "@/api/security";
import { Base64 } from "js-base64";
import VueQrcode from 'qrcode.vue'

export default {
  components: {
    'qrcode': VueQrcode
  },
  data() {
    return {
      loading: false,
      form: {
        newPwd: "",
        confirmPwd: "",
        mfaEnabled: false,
      },
      qrDialogVisible: false,
      qrCodeData: '',
      totpCode: '',
    };
  },
  mounted() {
    this.loading = true;
    userSelf().then(response => {
      if (response && response.data) {
        this.form.mfaEnabled = response.data["mfa_enabled"] || false;
      }
    })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Failed to get user MFA status:', error);
        this.$message.error('Failed to get MFA status');
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    validatePass2(rule, value, callback) {
      if (value === "") {
        callback(new Error("Confirm Password is empty"));
      } else if (value !== this.form.newPwd) {
        callback(
          new Error("New Password and confirm Password are inconsistent")
        );
      } else {
        callback();
      }
    },
    reset() {
      this.$refs.form.resetFields();
    },
    updatePwd() {
      this.$refs["form"].validate((valid) => {
        this.loading = true;
        if (valid) {
          updatePwd(this.$store.getters.name, {
            "New-Password": Base64.encode(this.form.newPwd),
          }).then(
            (res) => {
              this.$message.success("Password update successfully.", 5000);
              this.loading = false;
            },
            (error) => {
              // eslint-disable-next-line no-console
              console.error('Failed to update password:', error);
              this.$message.error('Failed to update password');
              this.loading = false;
            }
          );
        } else {
          this.loading = false;
          return false;
        }
      });
    },
    async verifyTotp() {
      if (!this.totpCode) {
        this.$message.error('Please enter TOTP code');
        return;
      }

      try {
        await setupTotp(this.totpCode);
        this.$message.success('MFA setup successfully');
        this.qrDialogVisible = false;
        this.qrCodeData = '';
        this.totpCode = '';
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Invalid TOTP code:', error);
        this.$message.error('Invalid TOTP code');
      }
    },
    async handleMfaChange(newVal) {
      if (newVal) {
        // Enable MFA
        try {
          await this.$confirm('Do you want to enable 2FA?', 'Warning', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning'
          });

          const response = await getTotpSecret();
          this.qrCodeData = Base64.decode(response.data["Mfa-Uri"]);
          this.qrDialogVisible = true;
        } catch (error) {
          if (error === 'cancel') {
            this.form.mfaEnabled = false;
            return;
          }
          // eslint-disable-next-line no-console
          console.error('Failed to get TOTP secret:', error);
          this.$message.error('Failed to get TOTP secret');
          this.form.mfaEnabled = false;
        }
      } else {
        // Disable MFA
        try {
          await this.$confirm('Do you want to disable 2FA?', 'Warning', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning'
          });

          await disableTotp("self");
          this.$message.success('MFA disabled successfully');
        } catch (error) {
          if (error === 'cancel') {
            this.form.mfaEnabled = true;
            return;
          }
          // eslint-disable-next-line no-console
          console.error('Failed to disable MFA:', error);
          this.$message.error('Failed to disable MFA');
          this.form.mfaEnabled = true;
        }
      }
    }
  }
};
</script>

<style>
.line {
  text-align: center;
}

.text-center {
  text-align: center;
}
</style>
