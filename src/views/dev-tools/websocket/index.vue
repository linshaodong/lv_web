<template>
  <div class="app-container">
    <div class="crumbs">
          <el-breadcrumb separator="/">
              <el-breadcrumb-item><i class="el-icon-date"></i> 表单</el-breadcrumb-item>
              <el-breadcrumb-item>基本表单</el-breadcrumb-item>
          </el-breadcrumb>
      </div>
      <div class="container">
        <div class="form-box">
          <el-row>
            {{ curTitle }}
          </el-row>
          <el-row>
            <el-button @click="changeChannel(1)">频道1</el-button>
            <el-button @click="changeChannel(2)">频道2</el-button>
          </el-row>
            <el-form label-width="0px">
              <el-form-item label="">
                <div class="block">
                  <ul>
                    <li v-for="(v, k) in getMessage">
                      <div v-if="v.name === username">我: {{ v.message }}</div>
                      <div v-else>{{ v.name }}: {{ v.message }}</div>
                    </li>
                  </ul>
                </div>
              </el-form-item>
              <el-form-item label="">
                <el-input
                  type="textarea"
                  size='small'
                  placeholder="请输入内容"
                  v-model="putMessage">
                </el-input>
              </el-form-item>
              <el-form-item label="">
                <el-button type="primary" @click="wsSendMessage">发送</el-button>
                <el-button type="primary" @click="wsClear">清除聊天记录</el-button>
              </el-form-item>

              <el-form-item>
                <h3>服务启动步骤</h3>
                <ul>
                  <li>1. 服务器防火墙需开放65530端口</li>
                  <li>2. 服务端PHP需安装swoole扩展</li>
                  <li>3. 启动服务端根目录下脚本： heartbeat.sh</li>
                  <li>4. 如长期运行，需将heartbeat.sh部署至crontab</li>
                </ul>
              </el-form-item>
            </el-form>
        </div>
      </div>
  </div>
</template>


<script>
import { getToken } from '@/utils/auth'
import store from '@/store'
export default {
  data() {
    return {
      websocket: null,
      putMessage: '',
      getMessage: [],
      username: store.getters.name,
      curChannel: 0,
      curTitle: '',
      ip: '192.168.2.151',
      port: '65530'
    }
  },
  created() {
  },
  mounted() {
    this.webSocketInit()
  },
  methods: {
    wsClear() {
      sessionStorage.clear()
      this.getMessage = []
    },
    changeChannel(channel) {
      this.curChannel = channel
      var msg = sessionStorage.getItem('channel:' + this.curChannel)
      this.getMessage = JSON.parse(msg) === null ? [] : JSON.parse(msg)

      this.putMessage = 'connection'
      this.wsSendMessage()
    },
    webSocketInit() {
      this.websocket = new WebSocket('ws://' + this.ip + ':' + this.port)
      this.websocket.onopen = this.wsOpen
      this.websocket.onmessage = this.wsMessage
      this.websocket.onclose = this.wsClose
      this.websocket.onerror = this.wsError
    },
    wsOpen() {
      console.log('ws连接成功')
    },
    wsMessage(e) {
      var data = JSON.parse(e.data)
      console.log(data)

      if (data.message === 'connection_error') {
        this.$alert('请求失败，请稍后刷新页面重试', '系统提示', {
          confirmButtonText: '确定',
          callback: action => {
          }
        })
      } else if (data.message === 'connection_success') {
        this.curTitle = '当前频道：' + this.curChannel
      } else {
        if (data.channel === this.curChannel) {
          this.getMessage.push(data)
          sessionStorage.setItem('channel:' + this.curChannel, JSON.stringify(this.getMessage))
        } else {
          var tmp = sessionStorage.getItem('channel:' + data.channel)
          tmp = JSON.parse(tmp) === null ? [] : JSON.parse(tmp)
          tmp.push(data)
          sessionStorage.setItem('channel:' + data.channel, JSON.stringify(tmp))
        }
      }
    },
    wsClose() {
      console.log('ws连接关闭')
    },
    wsError() {
      console.log('ws连接异常')
    },
    wsSendMessage() {
      if (this.curChannel === 0) {
        this.$alert('请选择频道', '系统提示', {
          confirmButtonText: '确定',
          callback: action => {
          }
        })
      }

      if (this.websocket == null) {
        this.webSocketInit()
        this.changeChannel(this.curChannel)
      }

      if (this.putMessage !== '' && this.putMessage !== undefined && this.putMessage != null) {
        var xToken = getToken()
        var message = { 'xToken': xToken, 'channel': this.curChannel, 'msg': this.putMessage }
        this.websocket.send(JSON.stringify(message))
        this.putMessage = ''
      }
    }
  }
}
</script>
<style>
  ul {list-style:none;}
  .block {overflow-y: scroll;max-height: 300px;}
</style>

