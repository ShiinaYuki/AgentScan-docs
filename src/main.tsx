import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowRight,
  Check,
  CircleAlert,
  Download,
  ExternalLink,
  FileArchive,
  FileCode2,
  FolderOpen,
  GitBranch,
  Menu,
  Network,
  Play,
  Search,
  ShieldCheck,
  X,
  ZoomIn,
} from 'lucide-react'
import './style.css'

type PageId = 'quickstart' | 'capabilities' | 'privacy' | 'feedback'

type TocItem = {
  id: string
  label: string
}

type SearchItem = TocItem & {
  page: PageId
  pageLabel: string
  summary: string
  terms: string
}

const quickstartToc: TocItem[] = [
  { id: 'platform', label: '安装与平台' },
  { id: 'project', label: '选择输入方式' },
  { id: 'scan', label: '开始扫描' },
  { id: 'report', label: '理解报告' },
]

const capabilityToc: TocItem[] = [
  { id: 'supported-inputs', label: '支持的输入' },
  { id: 'analysis-scope', label: '分析范围' },
  { id: 'report-output', label: '报告内容' },
  { id: 'current-limits', label: '当前限制' },
]

const privacyToc: TocItem[] = [
  { id: 'local-analysis', label: '源代码是否离开本机' },
  { id: 'network-boundary', label: '何时会访问网络' },
  { id: 'data-lifecycle', label: '临时数据如何处理' },
  { id: 'result-redaction', label: '结果如何脱敏' },
  { id: 'analysis-warnings', label: '分析不完整时' },
]

const feedbackToc: TocItem[] = [
  { id: 'feedback-type', label: '选择反馈类型' },
  { id: 'feedback-details', label: '准备复现信息' },
  { id: 'feedback-privacy', label: '提交前脱敏' },
  { id: 'feedback-submit', label: '前往 GitHub Issues' },
]

const tocByPage: Record<PageId, TocItem[]> = {
  quickstart: quickstartToc,
  capabilities: capabilityToc,
  privacy: privacyToc,
  feedback: feedbackToc,
}

const searchItems: SearchItem[] = [
  { id: 'quickstart', label: '快速开始', page: 'quickstart', pageLabel: '指南', summary: '完成第一次 Agent 项目安全扫描。', terms: '入门 下载 扫描 报告' },
  { id: 'platform', label: '安装与平台', page: 'quickstart', pageLabel: '快速开始', summary: '下载安装包并确认系统支持状态。', terms: 'macOS Linux Windows arm64 x64 release' },
  { id: 'project', label: '选择输入方式', page: 'quickstart', pageLabel: '快速开始', summary: '从本地目录、ZIP 或公开 Git 仓库开始。', terms: '项目 文件夹 压缩包 HTTPS 输入' },
  { id: 'scan', label: '开始扫描', page: 'quickstart', pageLabel: '快速开始', summary: '指定目标、提交扫描并等待报告。', terms: '进度 取消 完成 新建扫描' },
  { id: 'report', label: '理解报告', page: 'quickstart', pageLabel: '快速开始', summary: '从 Finding 追踪到来源证据、风险路径和修复建议。', terms: 'AgentBOM graph 图 ASI CWE remediation' },
  { id: 'capabilities', label: '扫描能力', page: 'capabilities', pageLabel: '参考', summary: '查看当前输入、分析、输出和能力限制。', terms: 'Prompt-to-Tool MCP capability security 限制' },
  { id: 'supported-inputs', label: '支持的输入', page: 'capabilities', pageLabel: '扫描能力', summary: '目录、ZIP 与无需凭据的公开 Git HTTPS 仓库。', terms: '输入 文件夹 压缩包 仓库' },
  { id: 'analysis-scope', label: '分析范围', page: 'capabilities', pageLabel: '扫描能力', summary: 'AgentFlow 框架语义、调用关系和安全查询。', terms: 'AgentIR ADG Prompt-to-Tool Capability Security' },
  { id: 'report-output', label: '报告内容', page: 'capabilities', pageLabel: '扫描能力', summary: 'Finding、AgentBOM、关系图与来源证据。', terms: '输出 graph evidence remediation' },
  { id: 'current-limits', label: '当前限制', page: 'capabilities', pageLabel: '扫描能力', summary: '不含动态监控、持久化和桌面报告导出。', terms: '运行时 export persistence Windows' },
  { id: 'privacy', label: '隐私与安全', page: 'privacy', pageLabel: '参考', summary: '查看 AgentScan 的数据与执行边界。', terms: 'privacy security 安全' },
  { id: 'local-analysis', label: '源代码是否离开本机', page: 'privacy', pageLabel: '隐私与安全', summary: '分析由本地运行时完成，不上传项目源码。', terms: '本地 云端 upload source' },
  { id: 'network-boundary', label: '何时会访问网络', page: 'privacy', pageLabel: '隐私与安全', summary: '公开 Git 获取会访问指定仓库，分析不会连接配置端点。', terms: 'HTTPS clone endpoint 网络' },
  { id: 'data-lifecycle', label: '临时数据如何处理', page: 'privacy', pageLabel: '隐私与安全', summary: '说明本地目录和临时工作区的处理方式。', terms: '清理 ZIP Git timeout cancel' },
  { id: 'result-redaction', label: '结果如何脱敏', page: 'privacy', pageLabel: '隐私与安全', summary: '结果展示前移除绝对路径并遮蔽秘密形状值。', terms: '字段投影 secret redaction path' },
  { id: 'analysis-warnings', label: '分析不完整时', page: 'privacy', pageLabel: '隐私与安全', summary: '读取和解析失败不会被当成无风险。', terms: 'warning 错误 解码 资源限制 incomplete' },
  { id: 'feedback', label: '问题反馈', page: 'feedback', pageLabel: '支持', summary: '准备必要的复现信息并提交问题。', terms: 'GitHub Issues bug 建议 误报 漏报' },
  { id: 'feedback-type', label: '选择反馈类型', page: 'feedback', pageLabel: '问题反馈', summary: '区分运行错误、误报漏报和功能建议。', terms: 'bug crash error false positive false negative feature' },
  { id: 'feedback-details', label: '准备复现信息', page: 'feedback', pageLabel: '问题反馈', summary: '整理版本、平台、输入方式和复现步骤。', terms: 'version macOS Linux arm64 x64 reproduce log' },
  { id: 'feedback-privacy', label: '提交前脱敏', page: 'feedback', pageLabel: '问题反馈', summary: '移除源码、凭据、绝对路径和敏感报告内容。', terms: 'privacy secret token source redaction 隐私' },
  { id: 'feedback-submit', label: '前往 GitHub Issues', page: 'feedback', pageLabel: '问题反馈', summary: '搜索已有问题后创建新的 Issue。', terms: 'GitHub issue 提交' },
]

const capabilityHashes = new Set(['capabilities', ...capabilityToc.map((item) => item.id)])
const privacyHashes = new Set(['privacy', ...privacyToc.map((item) => item.id)])
const feedbackHashes = new Set(['feedback', ...feedbackToc.map((item) => item.id)])
const SIDEBAR_DEFAULT_WIDTH = 238
const SIDEBAR_MIN_WIDTH = 190
const SIDEBAR_MAX_WIDTH = 360
const SIDEBAR_STORAGE_KEY = 'agentscan-doc-sidebar-width'

function clampSidebarWidth(width: number) {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width))
}

function readSidebarWidth() {
  try {
    const stored = Number(localStorage.getItem(SIDEBAR_STORAGE_KEY))
    return Number.isFinite(stored) ? clampSidebarWidth(stored) : SIDEBAR_DEFAULT_WIDTH
  } catch {
    return SIDEBAR_DEFAULT_WIDTH
  }
}

function pageFromHash(): PageId {
  const hash = location.hash.slice(1)
  if (capabilityHashes.has(hash)) return 'capabilities'
  if (privacyHashes.has(hash)) return 'privacy'
  return feedbackHashes.has(hash) ? 'feedback' : 'quickstart'
}

function SearchBox({ onNavigate }: { onNavigate: (item: SearchItem) => void }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  const results = useMemo(() => {
    if (!normalizedQuery) return []
    return searchItems
      .map((item) => {
        const label = item.label.toLocaleLowerCase('zh-CN')
        const terms = item.terms.toLocaleLowerCase('zh-CN')
        const summary = item.summary.toLocaleLowerCase('zh-CN')
        const score = label === normalizedQuery ? 0
          : label.startsWith(normalizedQuery) ? 1
            : label.includes(normalizedQuery) ? 2
              : terms.includes(normalizedQuery) ? 3
                : summary.includes(normalizedQuery) ? 4
                  : -1
        return { item, score }
      })
      .filter(({ score }) => score >= 0)
      .sort((left, right) => left.score - right.score)
      .map(({ item }) => item)
      .slice(0, 7)
  }, [normalizedQuery])

  useEffect(() => setActiveIndex(0), [normalizedQuery])
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    addEventListener('keydown', focusSearch)
    return () => removeEventListener('keydown', focusSearch)
  }, [])

  const choose = (item: SearchItem) => {
    onNavigate(item)
    setQuery('')
    setFocused(false)
  }

  return <div className="search-wrap" onFocus={() => setFocused(true)} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
  }}>
    <div className="search-control">
      <Search size={16} aria-hidden="true" />
      <input
        ref={inputRef}
        role="combobox"
        aria-label="搜索文档"
        aria-autocomplete="list"
        aria-expanded={focused && Boolean(normalizedQuery)}
        aria-controls="search-results"
        aria-activedescendant={results[activeIndex] ? `search-result-${activeIndex}` : undefined}
        placeholder="搜索文档"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && results.length) {
            event.preventDefault()
            setActiveIndex((index) => (index + 1) % results.length)
          } else if (event.key === 'ArrowUp' && results.length) {
            event.preventDefault()
            setActiveIndex((index) => (index - 1 + results.length) % results.length)
          } else if (event.key === 'Enter' && results[activeIndex]) {
            event.preventDefault()
            choose(results[activeIndex])
          } else if (event.key === 'Escape') {
            setFocused(false)
            inputRef.current?.blur()
          }
        }}
      />
      {query
        ? <button className="search-clear" type="button" title="清除搜索" aria-label="清除搜索" onClick={() => {
            setQuery('')
            inputRef.current?.focus()
          }}><X size={15} /></button>
        : <kbd className="search-shortcut">⌘K</kbd>}
    </div>
    {focused && normalizedQuery ? <div className="search-results" id="search-results" role="listbox">
      {results.length ? results.map((item, index) => <button
        id={`search-result-${index}`}
        type="button"
        role="option"
        aria-selected={index === activeIndex}
        className={index === activeIndex ? 'search-result selected' : 'search-result'}
        key={`${item.page}-${item.id}`}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => choose(item)}
      >
        <span className="search-result-copy">
          <strong>{item.label}</strong>
          <small>{item.summary}</small>
        </span>
        <span className="search-result-page">{item.pageLabel}</span>
      </button>) : <div className="search-empty">没有找到“{query.trim()}”</div>}
    </div> : null}
  </div>
}

function AgentScanWordmark() {
  return <span className="agentscan-wordmark">
    <svg className="agentscan-mark" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="10" r="8" />
      <circle cx="10" cy="10" r="4.75" />
      <circle cx="10" cy="10" r="1.5" className="agentscan-mark-core" />
      <path d="M11.7 11.4 20.5 18" />
    </svg>
    <span>AgentScan</span>
  </span>
}

function ProductPreview() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const screenshot = '/agentscan-report.png'
  const description = 'AgentScan 实际扫描报告：MCP 示例项目的风险摘要、AgentBOM 组件、调用图关系和优先风险'

  return <>
    <figure className="product-preview">
      <button className="preview-image-trigger" type="button" aria-label="放大查看 AgentScan 扫描报告" title="放大查看报告" onClick={() => dialogRef.current?.showModal()}>
        <img src={screenshot} width={3600} height={2220} alt={description} fetchPriority="high" />
        <span className="preview-zoom-icon" aria-hidden="true"><ZoomIn size={18} /></span>
      </button>
    </figure>
    <dialog className="preview-dialog" ref={dialogRef} aria-label="AgentScan 扫描报告原图" onClick={(event) => {
      if (event.target === event.currentTarget) dialogRef.current?.close()
    }}>
      <div className="preview-dialog-content">
        <header className="preview-dialog-header">
          <strong>AgentScan 扫描报告</strong>
          <a href={screenshot} target="_blank" rel="noreferrer" aria-label="在新标签页打开原图" title="打开原图"><ExternalLink size={18} /></a>
          <button type="button" aria-label="关闭报告图片" title="关闭" onClick={() => dialogRef.current?.close()}><X size={20} /></button>
        </header>
        <div className="preview-image-scroll" tabIndex={0} role="region" aria-label="报告图片">
          <img src={screenshot} width={3600} height={2220} alt={description} />
        </div>
      </div>
    </dialog>
  </>
}

function QuickstartPage() {
  return <article className="doc-article" id="quickstart">
    <section className="hero">
      <div className="eyebrow">开始使用</div>
      <h1>完成第一次 Agent 项目安全扫描</h1>
      <p className="lead">选择本地目录、ZIP 或公开 Git 仓库，在本地获得 Finding、AgentBOM 和可追溯的风险路径。</p>
      <div className="hero-actions">
        <a className="button primary" href="https://github.com/aicensus-labs/AgentScan/releases" target="_blank" rel="noreferrer"><Download size={17} />下载 AgentScan</a>
        <a className="button secondary" href="#report"><CircleAlert size={17} />如何阅读报告</a>
      </div>
    </section>

    <ProductPreview />

    <div className="journey">
      <section className="journey-section" id="platform">
        <span className="journey-number">1</span>
        <div className="section-heading"><span>准备应用</span><h2>安装与平台</h2><p>使用页面顶部的下载入口获取与你的系统匹配的安装包。安装用户不需要预先配置 Python、Node.js、Git 或目标项目依赖。</p></div>
        <div className="platform-panel">
          <div className="platform-table" role="table" aria-label="平台安装包">
            <div role="row"><strong role="cell">macOS</strong><span role="cell">Apple silicon · arm64</span><span role="cell" className="available"><Check size={13} />已发布</span></div>
            <div role="row"><strong role="cell">Linux</strong><span role="cell">x64</span><span role="cell" className="available"><Check size={13} />已发布</span></div>
            <div role="row"><strong role="cell">macOS</strong><span role="cell">Intel · x64</span><span role="cell" className="pending">安装包未发布</span></div>
            <div role="row"><strong role="cell">其他平台</strong><span role="cell">Windows、Linux arm64</span><span role="cell" className="pending">暂未支持</span></div>
          </div>
        </div>
      </section>

      <section className="journey-section" id="project">
        <span className="journey-number">2</span>
        <div className="section-heading"><span>确定分析范围</span><h2>选择输入方式</h2><p>在 AgentScan 概览页选择本地目录、ZIP 或公开 Git 仓库，并确认目标已获得分析授权。</p></div>
        <div className="input-options">
          <div><FolderOpen size={20} /><strong>本地目录</strong><p>点击“选择项目目录”，使用系统文件选择器指定项目。</p></div>
          <div><FileArchive size={20} /><strong>ZIP 压缩包</strong><p>导入项目归档；危险路径、符号链接和超限内容会被拒绝。</p></div>
          <div><GitBranch size={20} /><strong>公开 Git</strong><p>输入无凭据的 HTTPS 地址；不获取子模块、Git LFS、hooks 或凭据。</p></div>
        </div>
      </section>

      <section className="journey-section" id="scan">
        <span className="journey-number">3</span>
        <div className="section-heading"><span>提交任务</span><h2>开始扫描</h2><p>指定项目后，“开始扫描”按钮会变为可用。点击按钮后留在概览页查看进度；扫描期间可以取消任务。</p></div>
        <div className="scan-track" aria-label="开始扫描操作顺序">
          <span className="done"><Check size={14} /><b>选择输入</b><small>目录 / ZIP / Git</small></span>
          <ArrowRight size={15} />
          <span className="done"><Check size={14} /><b>确认目标</b><small>名称与路径</small></span>
          <ArrowRight size={15} />
          <span className="active"><Play size={14} /><b>开始扫描</b><small>提交任务</small></span>
          <ArrowRight size={15} />
          <span><ShieldCheck size={14} /><b>查看报告</b><small>分析完成</small></span>
        </div>
      </section>

      <section className="journey-section report-section" id="report">
        <span className="journey-number">4</span>
        <div className="section-heading"><span>从结论回到源码</span><h2>理解报告</h2><p>从一个 Finding 开始，依次核对来源证据、风险路径和修复建议，不要只根据风险数量做判断。</p></div>
        <div className="evidence-flow">
          <div><CircleAlert size={20} /><small>01 · Finding</small><strong>确认风险原因</strong><p>查看严重性、置信度和规则映射。</p></div>
          <ArrowRight className="flow-arrow" size={18} />
          <div><FileCode2 size={20} /><small>02 · 来源证据</small><strong>核对文件位置</strong><p>确认源码是否支持当前结论。</p></div>
          <ArrowRight className="flow-arrow" size={18} />
          <div><Network size={20} /><small>03 · 风险路径</small><strong>查看完整上下文</strong><p>定位经过的 Agent、工具和关系。</p></div>
          <ArrowRight className="flow-arrow" size={18} />
          <div><ShieldCheck size={20} /><small>04 · 修复建议</small><strong>确定修改范围</strong><p>结合 remediation 安排修复与复核。</p></div>
        </div>
      </section>
    </div>

  </article>
}

function CapabilitiesPage() {
  return <article className="doc-article reference-page" id="capabilities">
    <section className="hero compact-hero">
      <div className="eyebrow">参考</div>
      <h1>扫描能力</h1>
      <p className="lead">了解 AgentScan 当前可以接收什么输入、分析哪些风险，以及报告能提供哪些可核对的信息。</p>
    </section>
    <div className="reference-sections">
      <section id="supported-inputs"><span>01</span><div><h2>支持的输入</h2><p>桌面端支持用户明确选择的本地目录、ZIP 归档，以及无需凭据即可访问的公开 Git HTTPS 仓库。每次只分析一个确认过的目标。</p></div></section>
      <section id="analysis-scope"><span>02</span><div><h2>分析范围</h2><p>AgentFlow 从静态文件中提取框架语义、Agent 与工具关系，并运行 Prompt-to-Tool 和 Capability Security 风险查询。扫描不会启动目标项目或进行运行时行为监控。</p></div></section>
      <section id="report-output"><span>03</span><div><h2>报告内容</h2><p>报告包含证据支持的 Finding、AgentBOM 组件、调用与依赖图、严重性、风险原因、修复建议和对应的来源位置。分析覆盖不足时会同时保留警告。</p></div></section>
      <section id="current-limits"><span>04</span><div><h2>当前限制</h2><p>当前版本不提供动态监控、跨设备结果聚合、私有仓库凭据管理、报告持久化或桌面报告导出。安装包的平台状态以快速开始页为准。</p></div></section>
    </div>
  </article>
}

function PrivacyPage() {
  return <article className="doc-article reference-page" id="privacy">
    <section className="hero compact-hero">
      <div className="eyebrow">参考</div>
      <h1>隐私与安全</h1>
      <p className="lead">了解项目源码、网络请求、临时工作区和报告数据在一次扫描中的实际处理边界。</p>
    </section>
    <div className="reference-sections">
      <section id="local-analysis"><span>01</span><div><h2>源代码是否离开本机</h2><p>静态分析由随应用提供的本地运行时完成，当前版本不会把项目源码上传到云端分析服务。AgentScan 只读取用户明确选择或确认的项目范围，不修改项目文件。</p></div></section>
      <section id="network-boundary"><span>02</span><div><h2>何时会访问网络</h2><p>只有选择公开 Git 输入时，AgentScan 才会访问用户指定的 HTTPS 仓库并执行受限浅克隆。它不使用凭据，不获取子模块、Git LFS 或 hooks，也不会连接项目配置中声明的服务端点。</p></div></section>
      <section id="data-lifecycle"><span>03</span><div><h2>临时数据如何处理</h2><p>本地目录会在原位置读取。ZIP 和公开 Git 内容会进入 AgentScan 管理的临时工作区；原始分析输出也保存在应用管理的临时目录中，并在成功、失败、超时或取消后清理。</p></div></section>
      <section id="result-redaction"><span>04</span><div><h2>结果如何脱敏</h2><p>报告进入界面前只保留允许展示的字段，并遮蔽秘密形状值和绝对项目路径。来源证据尽可能使用相对于扫描目标的路径，便于核对而不暴露本机目录结构。</p></div></section>
      <section id="analysis-warnings"><span>05</span><div><h2>分析不完整时</h2><p>权限、读取、解码、语法解析或资源限制问题会作为明确警告保留，不会被转换成“没有风险”的结论。处理结果时应先确认是否存在这些警告。</p></div></section>
    </div>
  </article>
}

function FeedbackPage() {
  return <article className="doc-article reference-page" id="feedback">
    <section className="hero compact-hero">
      <div className="eyebrow">支持</div>
      <h1>问题反馈</h1>
      <p className="lead">提供可以复现、已经脱敏的信息，帮助维护者判断问题发生在哪个环节并尽快跟进。</p>
    </section>
    <div className="reference-sections">
      <section id="feedback-type"><span>01</span><div><h2>选择反馈类型</h2><p>运行错误请说明失败发生在哪一步；误报或漏报请描述期望的安全结论；功能建议请说明要解决的实际场景。一次 Issue 尽量只讨论一个问题。</p></div></section>
      <section id="feedback-details"><span>02</span><div><h2>准备复现信息</h2><p>请提供 AgentScan 版本、操作系统与架构、输入方式、复现步骤、预期结果和实际结果。如果界面显示错误或分析警告，请附上相关文字。</p></div></section>
      <section id="feedback-privacy"><span>03</span><div><h2>提交前脱敏</h2><p>不要上传项目源码、仓库凭据、访问令牌、绝对路径或未经检查的完整报告。需要提供证据时，只保留能够说明问题的最小片段，并替换其中的敏感值。</p></div></section>
      <section id="feedback-submit"><span>04</span><div><h2>前往 GitHub Issues</h2><p>提交前先搜索是否已有相同问题；如果没有，请使用清晰的标题，并按照上面的信息顺序描述问题。</p><a className="button primary feedback-button" href="https://github.com/aicensus-labs/AgentScan/issues" target="_blank" rel="noreferrer">打开 GitHub Issues<ExternalLink size={16} /></a></div></section>
    </div>
  </article>
}

function App() {
  const [page, setPage] = useState<PageId>(pageFromHash)
  const toc = tocByPage[page]
  const [activeSection, setActiveSection] = useState(toc[0].id)
  const [sidebarWidth, setSidebarWidth] = useState(readSidebarWidth)
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const mobileNavRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarWidth))
    } catch {
      // Local storage can be unavailable in private or restricted contexts.
    }
  }, [sidebarWidth])

  useEffect(() => {
    if (!isResizingSidebar) return
    const resize = (event: PointerEvent) => setSidebarWidth(clampSidebarWidth(event.clientX))
    const finishResize = () => setIsResizingSidebar(false)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    addEventListener('pointermove', resize)
    addEventListener('pointerup', finishResize)
    addEventListener('pointercancel', finishResize)
    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      removeEventListener('pointermove', resize)
      removeEventListener('pointerup', finishResize)
      removeEventListener('pointercancel', finishResize)
    }
  }, [isResizingSidebar])

  useEffect(() => {
    if (!mobileNavOpen) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!mobileNavRef.current?.contains(event.target as Node)) setMobileNavOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false)
    }
    addEventListener('pointerdown', closeOnOutsideClick)
    addEventListener('keydown', closeOnEscape)
    return () => {
      removeEventListener('pointerdown', closeOnOutsideClick)
      removeEventListener('keydown', closeOnEscape)
    }
  }, [mobileNavOpen])

  const adjustSidebarWidth = (delta: number) => setSidebarWidth((width) => clampSidebarWidth(width + delta))
  const shellStyle = { '--sidebar-width': `${sidebarWidth}px` } as CSSProperties

  const navigateTo = (item: Pick<SearchItem, 'page' | 'id'>) => {
    const samePage = item.page === page
    setPage(item.page)
    setActiveSection(item.id)
    setMobileNavOpen(false)
    history.pushState(null, '', `#${item.id}`)
    if (samePage) {
      if (item.id === item.page) scrollTo({ top: 0, behavior: 'instant' })
      else document.getElementById(item.id)?.scrollIntoView({ block: 'start' })
    }
  }

  useEffect(() => {
    const syncPage = () => setPage(pageFromHash())
    addEventListener('hashchange', syncPage)
    addEventListener('popstate', syncPage)
    return () => {
      removeEventListener('hashchange', syncPage)
      removeEventListener('popstate', syncPage)
    }
  }, [])

  useEffect(() => {
    const currentToc = tocByPage[page]
    const target = location.hash.slice(1)
    setActiveSection(currentToc.some((item) => item.id === target) ? target : currentToc[0].id)
    const element = currentToc.some((item) => item.id === target) ? document.getElementById(target) : null
    if (element) element.scrollIntoView({ block: 'start' })
    else scrollTo({ top: 0, behavior: 'instant' })

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (visible) setActiveSection(visible.target.id)
    }, { rootMargin: '-96px 0px -62% 0px' })
    currentToc.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [page])

  return <div className={isResizingSidebar ? 'shell is-resizing-sidebar' : 'shell'} style={shellStyle}>
    <aside className="sidebar">
      <nav aria-label="文档页面">
        <div className="nav-label">指南</div>
        <a className={page === 'quickstart' ? 'active' : ''} aria-current={page === 'quickstart' ? 'page' : undefined} href="#quickstart" onClick={(event) => {
          event.preventDefault()
          navigateTo({ page: 'quickstart', id: 'quickstart' })
        }}>快速开始</a>
        <div className="nav-label">参考</div>
        <a className={page === 'capabilities' ? 'active' : ''} aria-current={page === 'capabilities' ? 'page' : undefined} href="#capabilities" onClick={(event) => {
          event.preventDefault()
          navigateTo({ page: 'capabilities', id: 'capabilities' })
        }}>扫描能力</a>
        <a className={page === 'privacy' ? 'active' : ''} aria-current={page === 'privacy' ? 'page' : undefined} href="#privacy" onClick={(event) => {
          event.preventDefault()
          navigateTo({ page: 'privacy', id: 'privacy' })
        }}>隐私与安全</a>
        <div className="nav-label">支持</div>
        <a className={page === 'feedback' ? 'active' : ''} aria-current={page === 'feedback' ? 'page' : undefined} href="#feedback" onClick={(event) => {
          event.preventDefault()
          navigateTo({ page: 'feedback', id: 'feedback' })
        }}>问题反馈</a>
      </nav>
      <button
        className="sidebar-resizer"
        type="button"
        role="separator"
        aria-label="调整侧栏宽度"
        aria-orientation="vertical"
        aria-valuemin={SIDEBAR_MIN_WIDTH}
        aria-valuemax={SIDEBAR_MAX_WIDTH}
        aria-valuenow={sidebarWidth}
        title="拖拽调整侧栏宽度"
        onPointerDown={(event) => {
          event.preventDefault()
          setIsResizingSidebar(true)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            adjustSidebarWidth(-8)
          } else if (event.key === 'ArrowRight') {
            event.preventDefault()
            adjustSidebarWidth(8)
          } else if (event.key === 'Home') {
            event.preventDefault()
            setSidebarWidth(SIDEBAR_MIN_WIDTH)
          } else if (event.key === 'End') {
            event.preventDefault()
            setSidebarWidth(SIDEBAR_MAX_WIDTH)
          }
        }}
      />
    </aside>

    <main>
      <header className="site-header">
        <a className="header-brand" href="#quickstart" onClick={(event) => {
          event.preventDefault()
          navigateTo({ page: 'quickstart', id: 'quickstart' })
        }} aria-label="AgentScan 文档首页"><AgentScanWordmark /></a>
        <SearchBox onNavigate={navigateTo} />
        <div className="mobile-nav-wrap" ref={mobileNavRef}>
          <button
            className="mobile-menu-trigger"
            type="button"
            aria-label={mobileNavOpen ? '关闭文档导航' : '打开文档导航'}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-document-nav"
            title={mobileNavOpen ? '关闭文档导航' : '打开文档导航'}
            onClick={() => setMobileNavOpen((open) => !open)}
          >{mobileNavOpen ? <X size={19} /> : <Menu size={19} />}</button>
          {mobileNavOpen ? <nav className="mobile-nav-panel" id="mobile-document-nav" aria-label="移动端文档页面">
            <span>指南</span>
            <a className={page === 'quickstart' ? 'active' : ''} aria-current={page === 'quickstart' ? 'page' : undefined} href="#quickstart" onClick={(event) => {
              event.preventDefault()
              navigateTo({ page: 'quickstart', id: 'quickstart' })
            }}>快速开始</a>
            <span>参考</span>
            <a className={page === 'capabilities' ? 'active' : ''} aria-current={page === 'capabilities' ? 'page' : undefined} href="#capabilities" onClick={(event) => {
              event.preventDefault()
              navigateTo({ page: 'capabilities', id: 'capabilities' })
            }}>扫描能力</a>
            <a className={page === 'privacy' ? 'active' : ''} aria-current={page === 'privacy' ? 'page' : undefined} href="#privacy" onClick={(event) => {
              event.preventDefault()
              navigateTo({ page: 'privacy', id: 'privacy' })
            }}>隐私与安全</a>
            <span>支持</span>
            <a className={page === 'feedback' ? 'active' : ''} aria-current={page === 'feedback' ? 'page' : undefined} href="#feedback" onClick={(event) => {
              event.preventDefault()
              navigateTo({ page: 'feedback', id: 'feedback' })
            }}>问题反馈</a>
          </nav> : null}
        </div>
      </header>
      {page === 'quickstart' ? <QuickstartPage /> : page === 'capabilities' ? <CapabilitiesPage /> : page === 'privacy' ? <PrivacyPage /> : <FeedbackPage />}
      <nav className="toc" aria-label="本页目录">
        {toc.map((item) => <a
          className={activeSection === item.id ? 'current' : ''}
          aria-current={activeSection === item.id ? 'location' : undefined}
          href={`#${item.id}`}
          key={item.id}
          onClick={(event) => {
            event.preventDefault()
            navigateTo({ page, id: item.id })
          }}
        >{item.label}</a>)}
      </nav>
    </main>
  </div>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
