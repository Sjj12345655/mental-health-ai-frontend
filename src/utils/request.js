import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // 请求的前缀
  timeout: 5000, // 请求的超时时间
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token) {
      // 头名和格式必须与后端 application.yml 的 jwt.header(Authorization) / jwt.token-prefix(Bearer ) 一致
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    const { data, config } = response
    // 后端全局异常处理器即使出错也返回HTTP 200，错误信息放在业务code里，需在这里统一判断
    // 处理业务状态码
    if (data.code === '200') {
        return data.data
    }
    // 登录失效类code（-1通用失败 / 401未登录 / A0230系列token失效 / A0301访问未授权）
    const expiredCodes = ['-1', '401', 'A0230', 'A0231', 'A0300', 'A0301']
    if (expiredCodes.includes(data.code)) {
        const isLoginRequest = config.url?.includes('/login')
        ElMessage.error(data.msg || '登录过期，请重新登录')
        if (!isLoginRequest) {
          // 清除登录信息并跳转登录页
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          if (!window.location.pathname.startsWith('/auth/')) {
            window.location.href = '/auth/login'
          }
        }
        return Promise.reject(data)
    }
    // 其他业务错误：参数校验时具体原因在data里(如"邮箱格式不正确")，业务异常时原因在msg里(如"用户名已存在")
    const errMsg = (typeof data.data === 'string' && data.data) ? data.data : data.msg
    ElMessage.error(errMsg || '请求失败')
    return Promise.reject(data)
  },
  (error) => {
    // 对响应错误做点什么（HTTP状态码非2xx都会进入这里，比如后端过滤器返回的401/403）
    const { response } = error
    if (response) {
      const { status, data } = response
      if (status === 401) {
        // token缺失/过期/无效：清除登录态
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        ElMessage.error(data?.msg || '登录已过期，请重新登录')
        // 跳转登录页（已在登录/注册页时不再跳转，避免循环）
        if (!window.location.pathname.startsWith('/auth/')) {
          window.location.href = '/auth/login'
        }
      } else {
        // 其他HTTP错误，优先展示后端返回的msg
        ElMessage.error(data?.msg || `请求失败（${status}）`)
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      // 没有response：后端没启动、网络断开、跨域被拦等
      ElMessage.error('网络异常，请确认后端服务已启动')
    }
    return Promise.reject(error)
  }
)

export default service