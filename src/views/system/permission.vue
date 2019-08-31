<template>
    <section class="app-container">
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 10px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item>
            是否栏目：
            <el-select v-model="filters.is_show" placeholder="是否栏目">
              <el-option
                v-for="item in filtersIsShow"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-cascader
              :options="permissionOptions"
              :clearable=true
              change-on-select
              @change="handleItemChange"
              @active-item-change="handleItemChange"
              placeholder="权限名称"
            ></el-cascader>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-on:click="getList">查询</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" :loading="refresh" @click="refreshPermissions">{{ refreshTitle }}</el-button>
      </el-col>

      <!--列表-->
      <el-table v-loading="loading" :data="data" highlight-current-row @selection-change="selsChange" style="width: 100%;" :row-class-name="tableRowClassName">
        <el-table-column type="selection" width="55">
        </el-table-column>
        <el-table-column prop="id" width="60" label="ID">
        </el-table-column>
        <el-table-column prop="name" label="权限名称">
        </el-table-column>
        <el-table-column prop="path" label="权限路径" width="460">
        </el-table-column>
        <el-table-column prop="is_show" label="是否栏目" :formatter="isShow">
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间">
        </el-table-column>
        <el-table-column prop="updated_at" label="修改时间">
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    <!--页码-->
    <el-pagination background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="15" :total="total" style="text-align:center;margin-top:10px">
    </el-pagination>

    <!--编辑界面-->
      <el-dialog
        title="编辑" 
        :visible.sync="dialogFormVisible" 
        :close-on-click-modal="false" 
        width="50%">
        <el-form :model="editForm" label-width="100px" ref="editForm">
          <el-form-item label="是否为栏目" prop="status">
            <el-select v-model="editForm.is_show" placeholder="请选择">
              <el-option
                v-for="item in isShowStr"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click.native="resetForm()">取消</el-button>
          <el-button type="primary" @click="updateData">修改</el-button>
        </div>
      </el-dialog>
    </section>
</template>

<script>
import nxTreeTable from '@/components/nx-tree-table'
import {
  getList,
  refresh,
  editPermission,
  getTotal
} from '@/api/permission-table'

export default {
  name: 'treeTableDemo',
  components: { nxTreeTable },
  data() {
    return {
      permissions: [],
      permissionOptions: [],
      total: 0,
      page: 1,
      loading: true,
      isShowStr: [{
        value: 0,
        label: '否'
      }, {
        value: 1,
        label: '是'
      }],
      filtersIsShow: [{
        value: -1,
        label: '全部'
      }, {
        value: 0,
        label: '否'
      }, {
        value: 1,
        label: '是'
      }],
      filters: {
        is_show: -1,
        permission: ''
      },
      dialogFormVisible: false,
      refresh: false,
      refreshTitle: '刷新权限',
      columns: [
        {
          text: '权限名称',
          value: 'name'
        },
        {
          text: 'key',
          value: 'key'
        }
      ],
      data: [
      ],
      defaultId: 0,
      // 编辑界面数据
      editForm: {
        is_show: 0,
        icon: ''
      }
    }
  },
  mounted: function() {
    this.getSelect()

    this.getList()
  },
  methods: {
    resetForm() {
      this.dialogFormVisible = false
      this.$refs['editForm'].resetFields()
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.is_show === 1) {
        return 'nav-row'
      }
      return ''
    },
    handleItemChange(e) {
      var index = e.length - 1
      this.filters.permission = e[index]
      console.log(this.filters.permission)
    },
    getSelect() {
      getTotal().then(res => {
        var permissions = res.list
        this.permissionOptions = this.initPermission(permissions)
      }).catch(() => {

      })
    },
    initPermission: function(e) {
      var permissionOptions = []
      for (var i = 0; i < e.length; i++) {
        var tmp = []
        tmp['value'] = e[i].id_path === '' ? e[i].id : e[i].id_path + '|' + e[i].id
        tmp['label'] = e[i].name

        if (e[i].children !== null && e[i].children !== undefined) {
          var children = this.initPermission(e[i].children, i)
          tmp['children'] = children
        }
        permissionOptions[i] = tmp
      }

      return permissionOptions
    },
    // 获取用户列表
    handleCurrentChange(val) {
      this.page = val
      this.getList()
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels
    },
    // 编辑
    updateData() {
      const para = Object.assign({}, this.editForm)
      para.id = this.defaultId

      editPermission(para).then(res => {
        this.$message({
          message: '提交成功',
          type: 'success'
        })
        this.$refs['editForm'].resetFields()
        this.dialogFormVisible = false
        this.getList()
      })
    },
    handleEdit(index, row) {
      this.defaultId = row.id
      this.dialogFormVisible = true

      this.editForm = {
        is_show: parseInt(row.is_show),
        icon: row.icon
      }

      setTimeout(() => {
        this.$refs.editForm.clearValidate()
        console.log(this.$refs)
      }, 100)
    },
    isShow(row, column) {
      return parseInt(row.is_show) === 0 ? '否' : '是'
    },
    getList() {
      const para = {
        page: this.page,
        is_show: this.filters.is_show,
        id_path: this.filters.permission
      }

      getList(para).then(res => {
        console.log(res)
        this.data = res.list
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    refreshPermissions() {
      this.refresh = true
      this.refreshTitle = '正在刷新中，请不要关闭本页面'

      refresh().then(res => {
        this.refresh = false
        this.refreshTitle = '刷新权限'
        this.$message({
          message: '刷新成功',
          type: 'success'
        })
        this.getList()
      }).catch(() => {
        this.refresh = false
        this.refreshTitle = '刷新权限'
      })
    }
  }
}
</script>

<style>
  .el-table .nav-row {
    background: #fafafa;
  }
</style>

