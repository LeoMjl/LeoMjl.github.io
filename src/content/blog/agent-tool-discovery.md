# Agent缺的不是工具，是发现工具的能力

![封面：Agent 能力发现层](../assets/cover-agent-discovery-v2.png)

你在电脑上装了几十个 MCP server，skills 目录里塞满了社区分享的配置，每次让 Agent 干活，它要么用错工具，要么完全不知道某个工具存在。你以为是工具不够多，又去搜了一堆新的装上。

问题不在数量。在于 Agent 没有"发现层"。

## 手工装工具的Agent，像个没地图的搬家公司

想象你是一家搬家公司的调度员。每接一单，你先去仓库翻一遍——这里堆着螺丝刀、那里塞着包装箱、角落里还有搬家带——然后凭记忆告诉工人该拿什么。活少还行，活一多，你就漏东西、拿错东西。

这就是当前大多数 Agent 的现状。你在配置里静态列出可用的 skill 列表，Agent 启动时一次性加载所有工具。但真实任务千变万化——今天查 GitHub PR，明天解析 PDF，后天调用某个三周前装完就忘掉的 API。静态工具注册表根本跟不上。

更糟的是安全问题。你把所有工具一股脑暴露给 Agent，它就可能把"查询用户"的 tool 当成"删除用户"来调用。MCP 官方文档为此明确区分了 Resources 和 Tools：Resources 主要提供上下文，风险较低；Tools 执行动作，需要更强的安全边界。但在大多数实现里，这两者被混在一起——Agent 拿到什么用什么，毫无节制。

GitHub 在 2026 年 6 月 25 日发布的 Copilot agentic harness 博文也点出了同一件事：模型只是"智能来源"，真正的 agentic harness 负责工具编排、上下文管理、模型路由与效率。工具发现和调度，不该压在模型身上。

## ARD四步法：先查目录，再连工具

2026 年 6 月 17 日，Hugging Face 和 Google 在同一天分别发布了 ARD（Agentic Resource Discovery）的实践和规范。这不是巧合——两边独立推演出了同一个结论：Agent 需要一套标准化机制来发现和连接工具，不能靠手工配置。

ARD 把这件事拆成了四步：

**Catalog（能力目录）**——Agent 先查目录，目录不存工具本身，只存工具的描述、能力标签、连接方式和信任凭证。Hugging Face 的 HF Discover 是第一个参考实现，让 Agent 可以搜索 tools、skills、MCP server、应用程序甚至其他 Agent。你可以把它理解为"工具界的黄页"——查到编号，不直接给你实物。

**Registry（注册中心）**——目录告诉你有什么，注册中心告诉你哪个可信。Google 的 ARD 规范特别强调了注册中心的身份验证和信任链——不是谁发布了一个 tool 你都要用，得验证发布者身份、工具的数字签名和历史使用记录。

**Verify（验证）**——执行前，Agent 要验证候选工具是否真的匹配当前任务。不是简单的关键词检索，而是理解任务语义、检查工具的能力边界和前置条件。比如任务要"读 Issue"，一个只有 write 权限的 tool 就该被过滤掉。

**Connect（连接）**——验证通过后才建立连接、绑定 session、开始调用。连接是"按需"的——任务结束就断开，不长期持有工具句柄。这大幅缩小了攻击面。

四步走下来，工具的生命周期从"装上去就不管"变成了"查询→验证→连接→释放"的动态闭环。

## 搬到自己手里：从Hermes到Obsidian的发现层落地

这套逻辑不只是企业级 Agent 平台的专利。个人开发者的 Agent 工作流同样可以落地——而且大部分组件你手头已经有了。

以 Hermes Agent 为例。它的 profiles 系统天然就是"能力边界"的载体——每个 profile 定义了该 Agent 实例能做什么、用哪些 skill、连接哪些 MCP server。但目前 profiles 里的 tool 列表是静态配置的。引入 ARD 思路后，profile 不再是工具清单，而是"能力发现器的入口"。

具体映射如下：

- Hermes 的 **skills 目录**充当你的本地 Catalog。每个 skill 的 SKILL.md 就是一条"能力条目"，描述该 skill 能做什么、需要什么前置条件、输出什么结果。
- MCP 的 **tools/list 端点**充当本地 Registry。它能实时返回当前可用的工具列表及其签名——你不需要手动维护一份副本。
- Profile 的 **allowlist 机制**充当 Verify 层。只允许 Agent 连接经过白名单验证的 MCP server 和 tool，拒绝一切未声明的能力调用。
- **按需 MCP session**就是 Connect。Agent 在接到任务后才建立连接，用完即断。

Obsidian 在整条链路里扮演"执行记录"的角色。每次 Agent 调用工具的结果自动写回 Obsidian vault，形成可搜索的行动日志。这些日志反过来又成为 Registry 的"使用历史"——下次查询目录时，Agent 可以优先选择"上次用得好"的工具，避开"上次翻车"的。

![架构图：本地 Agent 发现层流程](../assets/architecture-discovery-layer-v3.png)

## 一张可执行的清单

以下是一个本地"轻量 ARD"的伪代码流程。它不依赖任何外部服务，用你现有的 Hermes + MCP + Obsidian 就能跑起来：

```
任务 = "把 GitHub Issue #42 转成 Obsidian 笔记"

# 1. 查询本地 Catalog
匹配skills = 搜索("ai-catalog.json", 任务)
# ai-catalog.json 结构示例：
# {"skills": [{"name": "github-issues", "tags": ["github", "issue"],
#             "mcp_server": "github", "安全级别": "read"}]}
# 返回: [github-issues, obsidian-export]

# 2. 查询 Registry（调 MCP tools/list）
可用工具 = MCP.list_tools("github")
# 返回: [{name: "get_issue", 参数: {...}, 权限: "read"}, ...]

# 3. Verify：allowlist 交叉验证
已验证工具 = 取交集(可用工具, profile.allowlist)
# 过滤掉不在白名单的 tool。比如 allowlist 里只有 get_issue，
# 那 create_issue 就不会出现在"已验证工具"里

# 4. Connect 并执行（按需建立 MCP session）
session = MCP.connect("github", 已验证工具)
issue数据 = session.call("get_issue", {owner: "我", repo: "blog", issue: 42})
session.close()  # 用完即断

# 5. 写入 Obsidian（行动日志 + 待审核）
写入Obsidian("agent-log.md", {
    任务: 任务,
    使用工具: ["github/get_issue"],
    结果摘要: issue数据.title,
    时间戳: 当前时间()
})
```

关键点：Agent 不预先加载所有工具。它先查目录 → 找到候选 → 验证可信 → 按需连接 → 用完释放。每步都是懒加载，安全边界清晰。

## 发现只是起点：为什么还要加一层验收

有了发现层，Agent 知道有什么工具可用、该用哪个。但这还不够。

IBM 和 Hugging Face 在 2026 年 6 月 30 日联合发布的 ScarfBench 基准测试揭示了一个刺眼的问题：在企业迁移任务里，Agent 的自评严重不可靠。Agent 会自信地声称"已完成"，但独立验收发现实际完成度只有宣称的六成左右。换句话说，Agent 不仅可能用错工具，还可能"用错了却以为自己用对了"。

这意味着 ARD 的 Catalog → Registry → Verify → Connect 链条后面，还必须加一层 **Validation（验收）**。

对于个人开发者，最简单的验收机制是：Agent 的执行结果不直接写入生产环境，而是先写入 Obsidian 的"待审核"目录，由你肉眼确认后再归档。发现层帮你选对工具，验收层确保工具真的把活干好了。两者缺一不可。

