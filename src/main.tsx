import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

function App() {
  return <div className="shell"><aside><div className="brand">AgentScan</div><div className="label">开始使用</div><a className="active">快速开始</a><a>扫描项目</a><a>理解报告</a><div className="label">参考</div><a>扫描能力</a><a>隐私与安全</a><a>故障排查</a></aside><main><header><span>文档</span><span>AgentScan</span></header><article><p className="eyebrow">开始使用</p><h1>快速开始</h1><p className="lead">从安装 AgentScan 到完成第一次安全扫描，快速了解项目中的智能体组件、风险发现和证据路径。</p><hr/><h2>1. 安装并启动</h2><p>下载适合你操作系统的 AgentScan 安装包，启动应用后即可开始扫描。本地扫描默认在你的设备上完成。</p><h2>2. 选择项目</h2><p>在首页选择一个本地项目目录、ZIP 压缩包，或公开的 HTTPS Git 仓库。AgentScan 会先读取项目结构和配置中的静态证据。</p><h2>3. 查看结果</h2><p>扫描完成后，你可以查看 AgentBOM、风险发现、关联组件和图中的风险路径。每个结论都应结合来源位置和分析警告一起理解。</p><div className="notice"><strong>扫描边界</strong><br/>AgentScan 不执行项目代码、不安装依赖、不启动智能体或工具，也不会连接项目配置中的端点。</div><h2>下一步</h2><div className="links"><a>了解扫描能力 <small>支持的输入与输出</small></a><a>理解报告 <small>从发现到证据路径</small></a></div></article></main></div>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
