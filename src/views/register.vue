<template>
    <div class="container">
        <div class="title">
            <div class="title-text">
                <h2>创建您的账户</h2>
                <p>请填写注册信息</p>
            </div>
        </div>
        <div class="form-container">
            <el-form label-position="top" :model="formData" :rules="rules" ref="submitFormRef">
                <el-form-item label="用户名或邮箱" prop="username">
                    <el-input v-model="formData.username" placeholder="请输入用户名" size="large" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="formData.email" placeholder="请输入邮箱" size="large" />
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="formData.nickname" placeholder="请输入昵称(可选)" size="large" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="formData.phone" placeholder="请输入手机号(可选)" size="large" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="formData.password" placeholder="请输入密码" size="large" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="formData.confirmPassword" placeholder="请再次输入密码" size="large" type="password" show-password />
                </el-form-item>
                <el-form-item>
                    <el-button class="btn" type="primary" size="large" @click="submitForm(submitFormRef)">注册</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>

</template>
<script setup>
import { ref, reactive } from 'vue'
import { register } from '@/api/frontend'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
const router = useRouter()
const formData = reactive({
    "username": "",
    "email": "",
    "nickname": "",
    "phone": "",
    "password": "",
    "confirmPassword": "",
    "gender": 0, // 性别
    "userType": 1 // 1为普通用户
})

const rules = reactive({
    "username": [
        { required: true, message: "请输入用户名", trigger: "blur" }
    ],
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "请输入正确的邮箱格式，如 123@qq.com", trigger: "blur" }
    ],
    "password": [
        { required: true, message: "请输入密码", trigger: "blur" }
    ],
    "confirmPassword": [
        { required: true, message: "请输入确认密码", trigger: "blur" }
    ]
})

// 表单提交

const submitFormRef = ref(null)
const submitForm = async (formEl) => {
    if (!formEl) return
    formEl.validate(async (valid) => {
        if (!valid) return
        // 后端@Pattern/@Size只对null放行、对空串报错，可选字段不填时需把空串转成null
        const payload = {
            ...formData,
            nickname: formData.nickname?.trim() || null,
            phone: formData.phone?.trim() || null
        }
        // 拦截器：成功时resolve后端data，失败时已统一弹出错误提示并reject
        register(payload).then(() => {
            ElMessage.success('注册成功')
            // 注册成功后跳转到登录页
            router.push('/auth/login')
        }).catch(() => {
            // 错误提示已由请求拦截器统一处理（如"邮箱格式不正确""用户名已存在"）
        })
    })
}
</script>

<style scoped lang="scss">.container {
    width: 384px;
    .flex-box {
        display: flex;
        align-items: center;
    }
    .title {
        .title-text {
            text-align: center;
            h2 {
                font-size: 36px;
                margin-bottom: 10px;
            }
            p {
                font-size: 18px;
                color: #6b7280;
            }
        }
    }
    .form-container {
        margin-top: 30px;
        .btn {
            margin-top: 40px;
            width: 100%;
        }
        .footer {
            padding: 30px;
            text-align: center;
        }
    }
}
</style>
