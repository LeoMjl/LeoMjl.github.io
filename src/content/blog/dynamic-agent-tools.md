# 别再把 Agent 工具写死了

## 你以为在扩能力，其实在堆脆弱性

很多人给 Agent 加能力的方式都很像：先塞一个浏览器工具，再接一个知识库，再接发布脚本，最后补几个 researcher、writer、editor 角色。刚开始很爽，因为几分钟就能把 demo 跑起来。

问题是，系统一旦进入真实使用，脆弱性会很快暴露出来。

- 一个工具换了参数，长 prompt 里那段说明就过期了。
- 一个角色多拿了上下文，另一个角色就开始串味。
- 你明明已经有 Obsidian 笔记、发布脚本、MCP server 和 SOP，但 Agent 每次都还像第一次上岗，得靠 prompt 再解释一遍。
- 系统规模一大，协调层就会变成“谁都能调、谁都不可信、谁都很难复用”的胶水地狱。

这不是模型不够聪明，而是系统没有把“能力发现”和“能力执行”分开。

![多角色 Agent 封面](../assets/cover.png)

## 问题的根，不是工具太少，而是没有发现层

Google 在 2026 年 6 月 17 日公布 Agentic Resource Discovery 规范时，强调的不是再造一个 Agent 框架，而是给生态补一个公开的发布、发现、验证能力的方式。Hugging Face 同一天给出的参考实现也很直接：把 discovery 放在 MCP、skills、A2A 前面，让 Agent 先按意图去找“哪里有我需要的能力”，而不是把所有能力预先写死。

这件事为什么重要？因为 MCP 其实已经把后半段做得不错了。MCP resources 解决的是：一个 server 怎么暴露资源、列资源、读资源、提供模板、通知更新。也就是说，它很擅长回答“我这里有什么”。

但它不回答另一个更早的问题：**我应该先去找哪个 server，信哪个发布者，用哪一组资源进入这次任务。**

这就是很多个人自动化系统的真实断点。你有很多能力，但系统不知道什么时候该挂哪一个、为什么信它、失败后该切到哪一个。结果就是所有东西都被塞进 coordinator 的 prompt 或某个 YAML 里，配置越长，系统越像定时炸弹。

如果你现在在用 Hermes 做多角色协作，或者在 Obsidian 上堆了很多脚本和知识插件，这种痛感会特别明显：你拥有的是一堆能力碎片，不是一个可以稳定扩展的系统。

## 把系统拆成四层，Agent 才会越长越稳

我现在更认同一种四层结构：Discovery Plane、Trust Plane、Resource Plane、Execution Plane。它不神秘，但很实用。

第一层是 `Discovery Plane`。
这里不执行任务，只回答一件事：针对当前意图，哪些工具、skills、MCP servers、agents 值得考虑。你可以把它理解成系统的“能力检索层”。它不该是一个手写清单，而应该是一个可查询、可筛选、可维护的小型 registry。

第二层是 `Trust Plane`。
不是搜到就能用。这里要决定来源是否可信、适配器是否经过验证、这次任务是否允许调用浏览器、是否允许写入知识库、是否允许直接发布。很多 Agent 事故，本质都不是不会做，而是边界没立住。

第三层是 `Resource Plane`。
这层最适合和 MCP、Obsidian、记忆系统结合。项目笔记、SOP、草稿、日报、待发布清单、历史运行记录，都不该只是“贴进 prompt 的文本”，而应该是可枚举、可读取、可模板化的资源。这样 Agent 拿到的不是一坨上下文，而是一组结构化入口。

第四层是 `Execution Plane`。
直到这一步，系统才真正挂载浏览器自动化、writer、publisher 或本地脚本。执行层只关心把选中的能力组合起来跑通，而不是替前面三层承担发现、信任和资源治理。

这四层一拆开，Hermes 这种多角色系统就顺了：coordinator 不再负责记住全部细节；researcher、writer、publisher 也不需要共享一份越来越脏的超长 prompt。

![四层架构示意图](../assets/architecture-layers.png)

## 放到 Hermes、MCP 和 Obsidian 里，应该怎么落地

如果把这套想法落到个人系统，我会这样做。

先做一个很小的内部 registry，记录几类对象：

- 可用 profile：`researcher`、`writer`、`editor`、`publish`
- 可用 MCP server：知识库、浏览器、发布平台、热点发现
- 可用资源模板：日报、选题 brief、草稿、发布结果、记忆卡片
- 可用动作边界：可读、可写、可发、需人工确认

然后让 coordinator 不直接写死工具名，而是先按任务查 registry。伪代码可以非常朴素：

```text
task_intent = "写一篇 AI Agent 架构实践博客并发布"
capabilities = discovery.search(task_intent)
trusted = trust.filter(capabilities, policy="blog_publish")
resources = resource.mount(trusted, targets=["obsidian_vault", "run_folder", "publish_state"])
plan = coordinator.compose(resources, roles=["researcher", "writer", "illustrator", "editor", "publish"])
execution.run(plan)
```

在这个流程里，Obsidian 不再只是“放文章的目录”，而是 Resource Plane 的一部分。比如：

- 选题 brief 是资源。
- 草稿和插图是资源。
- 历史发布结果是资源。
- 常用 workflow 和 profile 说明也是资源。

MCP 在这里的价值也会更清楚。它不是单纯“多一个调用协议”，而是让资源与动作拥有统一入口。你可以把 notes-to-action、memory、browser、publisher 都挂到同一套寻址方式里，再由 Discovery Plane 决定这次任务需要挂哪些东西。

这也是为什么我越来越不喜欢“把所有能力预装、让 Agent 自己看着办”的设计。那种系统短期灵活，长期不可控。相反，先发现、再验证、再挂资源、最后执行，虽然看起来多了一层，但扩展性和可维护性会高很多。

![Hermes 本地工作流示意图](../assets/hermes-workflow.png)

## 真正值得马上改的，不是模型，而是你的系统接线方式

如果你今天就想动手，我建议按这个顺序改。

1. 先盘点你现有的 Agent 能力，区分“发现、信任、资源、执行”四类，不要混成一锅。
2. 把常用知识入口资源化。Obsidian 笔记、SOP、发布清单、历史运行记录都应该可枚举，不要每次复制粘贴。
3. 给高风险动作加 Trust Plane。发文、写库、批量改文件、外网浏览都要有显式边界。
4. 最后再做角色拆分。没有前面三层，单纯加 researcher、writer、publisher 只会把脆弱性复制到更多角色里。

还要提醒一句：ARD 现在更像一个值得押注的方向，而不是已经完全统一的行业标准。它最有价值的地方，不是你明天就必须全面迁移，而是它把一个经常被忽略的问题说透了：**Agent 不是缺更多工具，而是缺一层负责任的发现机制。**

一旦你把这层补上，Hermes 这类多角色工作流、MCP 这类统一接口、Obsidian 这类本地知识系统，才会真正连成一个可扩展的个人自动化架构，而不是一串越来越难维护的脚本。

