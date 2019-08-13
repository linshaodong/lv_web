<template>
  <el-form class="login-form" status-icon :rules="loginRules" ref="loginForm" :model="loginForm" label-width="0">
    <el-form-item prop="user_name">
      <el-input size="small" @keyup.enter.native="handleLogin" v-model="loginForm.user_name" auto-complete="off" placeholder="请输入用户名">
        <i slot="prefix" class="icon-yonghu"></i>
      </el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input size="small" @keyup.enter.native="handleLogin" :type="passwordType" v-model="loginForm.password" auto-complete="off" placeholder="请输入密码">
        <i class="el-icon-view el-input__icon" slot="suffix" @click="showPassword"></i>
        <i slot="prefix" class="icon-mima"></i>
      </el-input>
    </el-form-item>
    <el-form-item prop="vcode" class="code" v-show="isCode">
      <el-input size="small" v-model="loginForm.vcode" auto-complete="off" placeholder="验证码"></el-input>
      <div @click="refreshCode" style="height: 43px;">
        <img :src="codeSrc"> 点击刷新验证码
      </div>
    </el-form-item>
    <!-- <el-checkbox v-model="checked">记住账号</el-checkbox> -->
    <el-form-item>
      <el-button type="primary" size="small" @click.native.prevent="handleLogin" class="login-submit">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { getDeviceId } from '@/utils/auth'
import { checkCaptcha } from '@/api/captcha'

export default {
  name: 'userlogin',
  data() {
    const validateCode = (rule, value, callback) => {
      if (this.isCode === false) {
        return true
      }

      if (value === '' || value === undefined) {
        callback(new Error('验证码不能为空'))
      }

      var params = {
        'vcode': value
      }
      checkCaptcha(params).then((res) => {
        if (res.code === 0) {
          callback()
        } else {
          this.refreshCode()
          callback(new Error('验证码错误'))
        }
      }).catch(() => {
        this.refreshCode()
        callback(new Error('当前网络繁忙，请稍后再试'))
      })
    }
    return {
      loginForm: {
        user_name: '',
        password: '',
        vcode: ''
      },
      checked: false,
      isCode: true,
      codeSrc: '',
      loginRules: {
        user_name: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 9, message: '账号或密码错误', trigger: 'blur' }
        ],
        vcode: [
          { required: true, trigger: 'blur', validator: validateCode }
        ]
      },
      passwordType: 'password'
    }
  },
  created() {
  },
  mounted() {
    this.refreshCode()
  },
  computed: {
  },
  props: [],
  methods: {
    refreshCode() {
      this.codeSrc = process.env.BASE_API + '/lv/captchas/' + Math.random() + '?device_id=' + getDeviceId()
    },
    showPassword() {
      this.passwordType === ''
        ? (this.passwordType = 'password')
        : (this.passwordType = '')
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          console.log(this.loginForm)
          this.$store.dispatch('Login', this.loginForm).then(res => {
            this.$router.push({ path: '/' })
          }).catch(() => {
            this.refreshCode()
          })
        }
      })
    }
  }
}
</script>
<style>
.code{
  cursor: pointer;
  color: #409eff;
}
.code:hover {
  text-decoration: underline;
}
.login-form .el-form-item{
  margin-bottom: 15px;
}
.login-submit{
  margin-top: 0px;
}
</style>
