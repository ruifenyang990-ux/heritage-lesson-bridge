import { useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowDown, ArrowUpRight, Check, Clipboard, Feather, LoaderCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { blink } from '@/blink/client'

const projects = ['羌绣', '藏羌剪纸', '博巴森根'] as const
const requiredHeadings = ['教学任务', '教学目标', '教学重难点', '学情分析', '教学过程', '教学资源', '课后反思']
const headingPattern = /^(?:#{1,3}\s*)?(?:[一二三四五六七八九十]+[、.．]\s*)?(AI助教推荐：课堂导入素材|课堂导入素材|教学任务|教学目标|教学重难点|学情分析|教学过程|教学资源|课后反思)\s*[:：]?\s*$/

type LessonBlock = { title: string; body: string }

function splitLesson(text: string): LessonBlock[] {
  const blocks: LessonBlock[] = []
  let current: LessonBlock | undefined
  for (const line of text.split('\n')) {
    const heading = line.trim().match(headingPattern)
    if (heading) {
      current = { title: heading[1].replace('AI助教推荐：', ''), body: '' }
      blocks.push(current)
    } else if (current) {
      current.body += `${current.body ? '\n' : ''}${line}`
    }
  }
  return blocks.map((block) => ({ ...block, body: block.body.trim() })).filter((block) => block.body)
}

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: '以美为桥·非遗入课' },
      { name: 'description', content: '为美术课堂连接非遗文化与创意实践。' },
    ],
  }),
  component: Home,
})

function Home() {
  const [heritage, setHeritage] = useState<(typeof projects)[number]>('羌绣')
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('小学四年级')
  const [lesson, setLesson] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const generateLesson = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setLesson('')
    try {
      const { text } = await blink.ai.generateText({
        messages: [
          {
            role: 'system',
            content: '你是一位熟悉《义务教育艺术课程标准（2022年版）》的小学、初中、高中美术教研员，也尊重非物质文化遗产的社区语境。用准确、温和、可落地的中文为一线美术教师备课。围绕审美感知、艺术表现、创意实践、文化理解设计活动，不把非遗简化为装饰，不编造具体传承人、年代或地方史实。总字数约500字，按要求的小标题逐段输出，活动需明确教师与学生行为、时间、评价方式。',
          },
          {
            role: 'user',
            content: `请为${audience}美术课设计一份以「${heritage}」为核心的教案，备课主题为「${topic.trim()}」。教学内容约500字，需适龄、可操作，并体现义务教育艺术课程标准中的核心素养。必须严格按以下七个小标题输出，标题一字不差：\n${requiredHeadings.join('、')}。\n另在七部分之后增加独立小标题「课堂导入素材」，给出一条可直接讲述的非遗背景小故事或视觉特征观察提示（约80字）。不确定的具体史实请提醒教师向当地传承人或可靠资料核实。`,
          },
        ],
        maxTokens: 1500,
      })
      setLesson(text.trim())
      toast.success('教案已生成，可以继续编辑与使用。')
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '生成教案时遇到问题，请稍后重试。'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const copyLesson = async () => {
    try {
      await navigator.clipboard.writeText(lesson)
      setCopied(true)
      toast.success('教案已复制到剪贴板。')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('复制失败，请选中教案文字后手动复制。')
    }
  }

  const blocks = lesson ? splitLesson(lesson) : []
  const intro = blocks.find((block) => block.title === '课堂导入素材')
  const lessonBlocks = blocks.filter((block) => block.title !== '课堂导入素材')

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="hero-nav fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 text-white md:px-10">
        <a href="#top" className="flex items-center gap-3" aria-label="返回首页">
          <span className="grid size-9 place-items-center rounded-full border border-white/35"><Feather size={17} /></span>
          <span className="text-sm font-medium tracking-[0.12em]">以美为桥 <span className="text-white/55">/</span> 非遗入课</span>
        </a>
        <a href="#workspace" className="group flex items-center gap-2 border-b border-white/50 pb-1 text-sm transition-colors hover:border-white">
          开始备课 <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </header>

      <section id="top" aria-label="非遗文化意象" className="heritage-hero">
        <article className="parallax-scene scene-qiang relative flex min-h-[100svh] items-center justify-center px-6 text-center">
          <div className="scene-shade absolute inset-0" />
          <div className="relative z-10 mx-auto max-w-5xl pt-12 text-white">
            <p className="mb-6 text-[10px] font-medium tracking-[0.42em] text-white/70 sm:text-xs">COUNTY-LEVEL CULTURAL HERITAGE EDUCATION</p>
            <h1 className="font-serif text-[clamp(2.8rem,7.2vw,6.4rem)] font-medium leading-[1.08] tracking-[0.01em]">以美为桥<br className="sm:hidden" />·非遗入课</h1>
            <p className="mx-auto mt-7 max-w-xl text-base tracking-[0.18em] text-white/85 sm:text-lg">藏羌非遗美育县域活化传承实践</p>
            <a href="#workspace" className="mt-14 inline-flex flex-col items-center gap-3 text-xs tracking-[0.2em] text-white/75 transition hover:text-white">
              <span>向下探索 · 开启备课</span><ArrowDown size={18} className="animate-bob" />
            </a>
          </div>
          <p className="absolute bottom-7 left-6 z-10 text-[10px] tracking-[0.18em] text-white/60 sm:left-10">01 / 03 纹样 · 羌绣意象</p>
        </article>
        <article className="parallax-scene scene-paper relative flex min-h-[88svh] items-center px-8 py-24 md:min-h-[100svh] md:px-[12vw]">
          <div className="scene-shade absolute inset-0" />
          <div className="relative z-10 max-w-lg text-white">
            <p className="mb-5 text-xs tracking-[0.28em] text-white/65">02 / 03 留白 · 纸上生花</p>
            <h2 className="font-serif text-5xl leading-tight sm:text-7xl">一刀一纸，<br />剪出山河。</h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/75">从对称、节奏与虚实之间，读懂民间造物的智慧。</p>
          </div>
        </article>
        <article className="parallax-scene scene-dance relative flex min-h-[88svh] items-end px-8 pb-24 pt-20 md:min-h-[100svh] md:items-center md:px-[58vw] md:pb-20">
          <div className="scene-shade absolute inset-0" />
          <div className="relative z-10 max-w-md text-white">
            <p className="mb-5 text-xs tracking-[0.28em] text-white/65">03 / 03 身体 · 博巴森根意象</p>
            <h2 className="font-serif text-5xl leading-tight sm:text-7xl">让身体，<br />记住节奏。</h2>
            <p className="mt-6 text-sm leading-7 text-white/75">传统不只被观看，也在每一次共同的表达中延续。</p>
          </div>
        </article>
        <p className="bg-foreground/90 px-4 py-2 text-center text-[10px] tracking-wide text-white/65">意象摄影：Europeana、Gabriela Starzec、Pema Gyamtsho / Unsplash</p>
      </section>

      <section id="workspace" className="relative px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-medium tracking-[0.22em] text-primary">备课工作台 · LESSON STUDIO</p>
              <h2 className="font-serif text-4xl leading-tight sm:text-5xl">让文化，走进美术课。</h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-muted-foreground">从一项非遗出发，把地方文化转化为可感知、可表达、可实践的课堂经验。</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.45fr)] lg:gap-10">
            <form onSubmit={generateLesson} className="h-fit rounded-[1.25rem] border border-border bg-card p-6 shadow-[var(--shadow-md)] sm:p-8">
              <div className="mb-8 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary"><Feather size={18} /></span>
                <div>
                  <h3 className="font-serif text-2xl">从灵感开始</h3>
                  <p className="mt-1 text-xs text-muted-foreground">为你的下一堂课设定方向</p>
                </div>
              </div>
              <label htmlFor="heritage" className="mb-2 block text-sm font-medium">非遗项目</label>
              <select id="heritage" value={heritage} onChange={(event) => setHeritage(event.target.value as (typeof projects)[number])} className="mb-6 h-12 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20">
                {projects.map((project) => <option key={project} value={project}>{project}</option>)}
              </select>
              <label htmlFor="topic" className="mb-2 block text-sm font-medium">备课主题</label>
              <input id="topic" value={topic} onChange={(event) => setTopic(event.target.value)} required maxLength={80} placeholder="例如：羌绣的色彩运用" className="mb-6 h-12 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/20" />
              <label htmlFor="audience" className="mb-2 block text-sm font-medium">授课对象</label>
              <input id="audience" value={audience} onChange={(event) => setAudience(event.target.value)} required maxLength={40} placeholder="例如：小学四年级" className="mb-8 h-12 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/20" />
              <button type="submit" disabled={loading} className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:cursor-wait disabled:opacity-65">
                {loading ? <><LoaderCircle size={17} className="animate-spin" />正在铺展灵感…</> : <><Sparkles size={16} />一键生成教案<ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></>}
              </button>
              <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">生成内容供教学设计参考，地方性史实请结合本地资料核验。</p>
            </form>

            <div aria-live="polite" className="min-h-[520px] rounded-[1.25rem] border border-border bg-card/70 p-6 shadow-[var(--shadow-sm)] sm:p-9">
              {loading ? (
                <div className="flex min-h-[450px] flex-col items-center justify-center text-center">
                  <span className="mb-6 grid size-16 place-items-center rounded-full bg-secondary text-primary"><LoaderCircle size={28} className="animate-spin" /></span>
                  <h3 className="font-serif text-2xl">正在为课堂编织灵感</h3>
                  <p className="mt-2 text-sm text-muted-foreground">结合「{heritage}」与「{audience}」的学习经验，整理教学思路…</p>
                  <div className="mt-9 w-full max-w-md space-y-3" aria-hidden="true"><div className="h-3 animate-pulse rounded-full bg-muted" /><div className="h-3 w-5/6 animate-pulse rounded-full bg-muted" /><div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" /></div>
                </div>
              ) : error ? (
                <div className="flex min-h-[450px] flex-col items-center justify-center text-center">
                  <span className="font-serif text-4xl text-primary">再试一次</span>
                  <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">{error}</p>
                  <p className="mt-3 max-w-md text-xs leading-6 text-muted-foreground">如果这是首次使用，请先批准匿名 AI 访问许可，再点击生成。</p>
                </div>
              ) : lesson ? (
                <div className="animate-fade-in">
                  <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
                    <div>
                      <p className="mb-2 text-[11px] tracking-[0.18em] text-primary">AI 教案草稿 · {heritage}</p>
                      <h3 className="font-serif text-3xl">{topic}</h3>
                      <p className="mt-2 text-xs text-muted-foreground">{audience} · 建议课时：40 分钟</p>
                    </div>
                    <button onClick={copyLesson} type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition hover:border-primary hover:text-primary active:scale-[0.98]">
                      {copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? '已复制' : '一键复制教案'}
                    </button>
                  </div>
                  <div className="space-y-6">
                    {lessonBlocks.length ? lessonBlocks.map((block) => <section key={block.title} className="border-l-2 border-accent pl-4 sm:pl-5">
                      <h4 className="mb-2 font-serif text-xl text-primary">{block.title}</h4>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/85">{block.body}</p>
                    </section>) : <p className="whitespace-pre-wrap text-sm leading-7">{lesson}</p>}
                  </div>
                  {intro && <aside className="mt-9 rounded-xl border border-accent/70 bg-secondary/65 p-5 sm:p-6">
                    <div className="mb-3 flex items-center gap-2 text-primary"><Sparkles size={16} /><h4 className="font-medium">AI 助教推荐：课堂导入素材</h4></div>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-secondary-foreground">{intro.body}</p>
                    <p className="mt-3 text-[11px] leading-5 text-muted-foreground">涉及地方口述传统或具体寓意时，建议课前向当地传承人及可靠资料核实。</p>
                  </aside>}
                  {!intro && <aside className="mt-9 rounded-xl border border-accent/70 bg-secondary/65 p-5 sm:p-6">
                    <div className="mb-3 flex items-center gap-2 text-primary"><Sparkles size={16} /><h4 className="font-medium">AI 助教推荐：课堂导入素材</h4></div>
                    <p className="text-sm leading-7 text-secondary-foreground">请从{heritage}的代表性纹样、材料或动作入手，引导学生先观察形状、节奏与色彩，再提出“这些视觉语言可能讲述了怎样的生活经验？”作为讨论问题。具体寓意可结合本地资料补充。</p>
                  </aside>}
                  <p className="mt-6 text-[11px] text-muted-foreground">生成式 AI 草稿 · 请依据本班学情与当地非遗资料进行审阅和调整。</p>
                </div>
              ) : (
                <div className="flex min-h-[450px] flex-col justify-center px-2 sm:px-7">
                  <p className="mb-5 text-xs tracking-[0.2em] text-primary">让传统，在课堂里发生</p>
                  <h3 className="max-w-lg font-serif text-4xl leading-[1.2] sm:text-5xl">每一种手艺，<br />都是一堂美育课。</h3>
                  <p className="mt-6 max-w-xl text-sm leading-8 text-muted-foreground">非遗不只是被观看的珍藏，更是理解生活、观察形式、表达自我的入口。选择一个项目与一个主题，让 AI 助教陪你把文化资源转化为有温度、有实践的美术课堂。</p>
                  <div className="mt-10 flex flex-wrap gap-2">{['审美感知', '艺术表现', '创意实践', '文化理解'].map((item) => <span key={item} className="rounded-full border border-border bg-background px-4 py-2 text-xs text-secondary-foreground">{item}</span>)}</div>
                  <p className="mt-10 text-xs text-muted-foreground">生成教案后，你可以一键复制全文，并获得一条可用于课堂导入的素材建议。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <footer className="border-t border-border px-6 py-7 text-center text-xs text-muted-foreground">以美为桥 · 非遗入课 <span className="mx-2">—</span> 让地方文化成为课堂的灵感源泉</footer>
    </main>
  )
}
