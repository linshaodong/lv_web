<template>
	<section class="app-container">
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters" @submit.native.prevent>
				<el-form-item>
					<el-input v-model="filters.name" placeholder="姓名"></el-input>
				</el-form-item>
        <el-form-item>
					<el-select v-model="filters.userStatus" placeholder="状态">
            <el-option
              v-for="item in filtersStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getUsers">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
                <el-form-item>
                    <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
                </el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table v-loading="loading" :data="users" highlight-current-row 
    @selection-change="selsChange"
    @sort-change="sortChange"
    :default-sort = "{prop: 'updated_at', order: 'descending'}"
     style="width: 100%;">
			<el-table-column type="selection" width="55"></el-table-column>
			<el-table-column type="index" width="60"></el-table-column>
			<el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="user_name" label="用户名"></el-table-column>
      <el-table-column prop="status" label="状态" :formatter="formatStatus" width="60"></el-table-column>
      <el-table-column prop="roles" label="角色" :formatter="formatRoles"></el-table-column>
      <el-table-column prop="last_ip" label="最后登录ip"></el-table-column>
			<el-table-column prop="created_at" label="创建时间"></el-table-column>
			<el-table-column prop="updated_at" label="修改时间" sortable></el-table-column>
			<el-table-column label="操作" width="150">
				<template slot-scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--页码-->
    <el-pagination background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="text-align:center;margin-top:10px">
    </el-pagination>
        <!--新增界面-->
		
		<!--编辑界面-->
		<el-dialog 
      :title="textMap[dialogStatus]" 
      :visible.sync="dialogFormVisible" 
      :show-close="false" 
      :close-on-click-modal="false"
      width="50%">
			<el-form :model="form" label-width="80px" :rules="formRules" ref="form">
				<el-form-item label="姓名" prop="name">
					<el-input v-model="form.name" auto-complete="off"></el-input>
				</el-form-item>

        <el-form-item label="用户名" prop="user_name">
					<el-input v-model="form.user_name" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option
              v-for="item in userStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="密码" prop="password">
					<el-input v-model="form.password" type="password" auto-complete="off"  style="width:50%; float:left;"></el-input>
          <el-row type="flex" class="row-bg" style="width:50%; float:left;top:25px;padding-left: 5px;">
            <el-col class="pwd"><div :class="pwd1"></div></el-col>
            <el-col class="pwd"><div :class="pwd2"></div></el-col>
            <el-col class="pwd"><div :class="pwd3"></div></el-col>
          </el-row>
          <span class="pwd-str">{{ pwdLevel }}</span>
				</el-form-item>

        <el-form-item label="重复密码" prop="re_password">
					<el-input v-model="form.re_password" type="password" auto-complete="off"></el-input>
				</el-form-item>

        <el-form-item label="角色" prop="roles">
            <el-checkbox-group 
                v-model="form.user_roles">
                <el-checkbox v-for="role in total_roles" :label="role.id" :key="role.id">{{role.name}}</el-checkbox>
            </el-checkbox-group>
        </el-form-item>

			</el-form>
			<div slot="footer" class="dialog-footer">
			 <el-button @click.native="resetForm()">取消</el-button>
       <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">添加</el-button>
       <el-button v-else type="primary" @click="updateData">修改</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
import {
  getUserListPage,
  removeUser,
  batchRemoveUser,
  editUser,
  addUser
} from '@/api/user-table'
import {
  getRoleTotal
} from '@/api/role-table'

export default {
  data() {
    var checkPwd = (rule, value, callback) => {
      // eslint-disable-next-line space-unary-ops
      if (! rule.required && value === '') {
        return callback()
      }

      if (value.length <= 8) {
        this.pwdLevel = ''
        this.pwd1 = 'grid-content bg-purple pwd-color'
        this.pwd2 = 'grid-content bg-purple pwd-color'
        this.pwd3 = 'grid-content bg-purple pwd-color'
        return callback(new Error('密码需要大于8位'))
      // eslint-disable-next-line space-unary-ops
      } else if (! value.match(/^[A-Za-z0-9]+$/)) {
        this.pwdLevel = ''
        this.pwd1 = 'grid-content bg-purple pwd-color'
        this.pwd2 = 'grid-content bg-purple pwd-color'
        this.pwd3 = 'grid-content bg-purple pwd-color'
        return callback(new Error('密码只能英文字母和数字'))
      }

      var level = 0
      if (value.match(/[A-Z]/)) {
        level = level + 1
      }
      if (value.match(/[a-z]/)) {
        level = level + 1
      }
      if (value.match(/[0-9]/)) {
        level = level + 1
      }

      if (level === 1) {
        this.pwdLevel = '弱'
        this.pwd1 = 'grid-content bg-purple pwd-color danger'
        this.pwd2 = 'grid-content bg-purple pwd-color'
        this.pwd3 = 'grid-content bg-purple pwd-color'
      } else if (level === 2) {
        this.pwdLevel = '中'
        this.pwd1 = 'grid-content bg-purple pwd-color warning'
        this.pwd2 = 'grid-content bg-purple pwd-color warning'
        this.pwd3 = 'grid-content bg-purple pwd-color'
      } else if (level === 3) {
        this.pwdLevel = '强'
        this.pwd1 = 'grid-content bg-purple pwd-color success'
        this.pwd2 = 'grid-content bg-purple pwd-color success'
        this.pwd3 = 'grid-content bg-purple pwd-color success'
      }

      return callback()
    }

    var rePwd = (rule, value, callback) => {
      var pwd = this.form.password 

      if (value !== pwd) {
        return callback(new Error('俩次密码不一致'))
      }

      return callback()
    }

    return {
      pwdLevel: '',
      pwd1: 'grid-content bg-purple pwd-color',
      pwd2: 'grid-content bg-purple pwd-color',
      pwd3: 'grid-content bg-purple pwd-color',
      loading: true,
      total_roles: [],
      dialogStatus: '',
      userStatus: [{
        value: 1,
        label: '正常'
      }, {
        value: 2,
        label: '锁定'
      }],
      textMap: {
        update: '编辑用户',
        create: '创建用户'
      },
      dialogFormVisible: false,
      filtersStatus: [{
        value: -1,
        label: '全部'
      }, {
        value: 1,
        label: '正常'
      }, {
        value: 2,
        label: '锁定'
      }],
      filters: {
        name: '',
        user_name: '',
        userStatus: -1,
        password: '',
        re_password: '',
        user_roles: []
      },
      users: [],
      total: 0,
      page: 1,
      sels: [], // 列表选中列
      orderBy: '',

      // 编辑界面数据
      form: {
        name: '',
        user_name: '',
        status: 1,
        password: '',
        re_password: '',
        user_roles: []
      },
      formRules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        user_name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        user_roles: [{ required: true, message: '请选择角色', trigger: 'blur' }],
        password: [
          { required: true, validator: checkPwd, trigger: 'blur' }
        ],
        re_password: [{ true: false, validator: rePwd, trigger: 'blur' }]
      }
    }
  },
  methods: {
    resetForm() {
      this.pwdLevel = ''
      this.pwd1 = 'grid-content bg-purple pwd-color'
      this.pwd2 = 'grid-content bg-purple pwd-color'
      this.pwd3 = 'grid-content bg-purple pwd-color'

      this.dialogFormVisible = false
      this.$refs['form'].resetFields()
    },
    formatRoles(row, column) {
      var rolesName = []
      var roles = JSON.parse(row.roles)
      for (var i = 0; i < this.total_roles.length; i++) {
        for (var j = 0; j < roles.length; j++) {
          if (this.total_roles[i].id === parseInt(roles[j])) {
            rolesName.push(this.total_roles[i].name)
          }
        }
      }

      return rolesName.join(',')
    },
    formatStatus(row, column) {
      return parseInt(row.status) === 1 ? '正常' : parseInt(row.status) === 2 ? '锁定' : '异常'
    },
    // 获取用户列表
    handleCurrentChange(val) {
      this.page = val
      this.getUsers()
    },
    getUsers() {
      const para = {
        page: this.page,
        name: this.filters.name,
        status: this.filters.userStatus,
        order: this.orderBy
      }

      getUserListPage(para).then(res => {
        this.total = res.total
        this.users = res.users
        this.loading = false
      }).catch(() => { this.loading = false })
    },
    // 删除
    handleDel(index, row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
      })
        .then(() => {
          const para = { id: row.id }
          removeUser(para).then(res => {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.getUsers()
          })
        })
        .catch(() => {})
    },
    // 显示编辑界面
    handleEdit(index, row) {
      this.defaultId = row.id
      this.dialogStatus = 'update'

      this.form = {
        name: row.name,
        user_name: row.user_name,
        status: parseInt(row.status),
        password: '',
        re_password: '',
        user_roles: JSON.parse(row.roles).map(Number)
      }

      this.formRules.password[0].required = false

      this.dialogFormVisible = true
    },
    // 显示新增界面
    handleAdd() {
      this.defaultId = 0
      this.dialogStatus = 'create'

      this.form = {
        name: '',
        user_name: '',
        status: 1,
        password: '',
        re_password: '',
        user_roles: []
      }

      this.formRules.password[0].required = true

      this.dialogFormVisible = true
    },
    // 编辑
    updateData() {
      if (this.form.password !== '' && this.form.password !== this.form.re_password) {
        this.$message.error('俩次密码不一致')
        return false
      }

      this.$refs.form.validate(valid => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {})
            .then(() => {
              const para = Object.assign({}, this.form)
              para.id = this.defaultId

              editUser(para).then(res => {
                this.$message({
                  message: '提交成功',
                  type: 'success'
                })
                
                this.resetForm()
                this.getUsers()
              })
            })
            .catch(e => {
              // 打印一下错误
              console.log(e)
            })
        }
      })
    },
    // 新增
    createData: function() {
      if (this.form.password !== this.form.re_password) {
        this.$message.error('俩次密码不一致')
        return false
      }

      this.$refs.form.validate(valid => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {})
            .then(() => {
              this.form.id = (parseInt(Math.random() * 100)).toString() // mock a id
              const para = Object.assign({}, this.form)
              addUser(para).then(res => {
                this.$message({
                  message: '提交成功',
                  type: 'success'
                })
                
                this.resetForm()
                this.getUsers()
              })
            })
            .catch(e => {
              // 打印一下错误
              this.resetForm()
              console.log(e)
            })
        }
      })
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels
    },
    // 批量删除
    batchRemove() {
      var ids = this.sels.map(item => item.id).toString()
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          const para = { ids: ids }
          batchRemoveUser(para).then(res => {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.getUsers()
          })
        })
        .catch(() => {})
    },
    getRoles() {
      getRoleTotal().then(res => {
        this.total_roles = res.roles
      })
    },
    sortChange(column) {
      this.orderBy = column.prop === null || column.order === null ? '' : column.prop + '|' + column.order
      this.getUsers()
    }
  },
  mounted() {
    this.getUsers()
    this.getRoles()
  }
}
</script>

<style scoped>
.el-form-permisson-item{
  max-height: 300px;
  overflow-y: scroll;
}
.pwd {
  margin-right: 2px;
  width: 30px;
}
.pwd-str {
  width: 100px;
  text-align: center;
  position: relative;
  top: -12px;
  left: 45px;
}
.pwd-color {
  border:1px solid #dcdfe6;
  height: 10px;
  width: 30px;
}
.danger {
  background: #f80505;
}
.warning {
  background: #fbc676;
}
.success {
  background: #67C23A;
}
</style>