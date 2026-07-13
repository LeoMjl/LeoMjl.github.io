import { useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  DownloadSimple,
  IdentificationCard,
  ShieldCheck,
} from "@phosphor-icons/react";
import { profile } from "../data/portfolio";

export function ResumePage() {
  const [state, setState] = useState("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const name = form.elements.namedItem("name")?.value.trim();
    const consent = form.elements.namedItem("consent")?.checked;

    if (!name) {
      setError("请输入您的姓名。");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("请输入有效的邮箱地址。");
      return;
    }
    if (!consent) {
      setError("请确认信息使用说明后再提交。");
      return;
    }

    const last = Number(localStorage.getItem("resume-request-last") || 0);
    if (Date.now() - last < 30_000) {
      setError("请求已收到，请稍后再试。");
      return;
    }

    setState("submitting");
    window.setTimeout(() => {
      localStorage.setItem("resume-request-last", String(Date.now()));
      setState("success");
    }, 700);
  };

  return (
    <div className="resume-page route-page">
      <div className="resume-intro">
        <p className="signal-label">RESUME REQUEST / 04</p>
        <h1>Let’s Build Something Meaningful</h1>
        <p>
          如需查看完整简历，请留下您的联系方式与联系目的。信息仅用于本次简历获取与后续沟通，
          不会在公开页面展示。
        </p>
        <div className="resume-trust-list">
          <span><IdentificationCard size={20} />提交后获取完整双页简历</span>
          <span><ShieldCheck size={20} />联系信息仅用于本次申请</span>
        </div>
      </div>

      <section className="resume-form-panel">
        {state === "success" ? (
          <div className="success-state" role="status">
            <CheckCircle size={48} weight="duotone" />
            <p className="signal-label">REQUEST VERIFIED</p>
            <h2>简历已准备好。</h2>
            <p>联系方式已确认，您现在可以获取马江霖的完整双页简历。</p>
            <a className="button button-primary" href="/assets/Jianglin-Ma-Resume.docx" download>
              <DownloadSimple size={18} /> 下载完整简历
            </a>
            <button
              className="button button-secondary"
              onClick={() => {
                setState("idle");
                setEmail("");
              }}
              type="button"
            >
              提交新的申请
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="form-grid">
              <label>
                <span>您的姓名</span>
                <input autoComplete="name" name="name" required />
              </label>
              <label>
                <span>您的邮箱</span>
                <input
                  aria-describedby={error ? "resume-error" : undefined}
                  autoComplete="email"
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                  required
                />
              </label>
            </div>
            <label>
              <span>公司或组织（可选）</span>
              <input autoComplete="organization" name="organization" />
            </label>
            <label>
              <span>联系目的</span>
              <select name="purpose" defaultValue="opportunity">
                <option value="opportunity">工作机会</option>
                <option value="research">研究交流</option>
                <option value="collaboration">项目合作</option>
                <option value="other">其他</option>
              </select>
            </label>
            <fieldset>
              <legend>简历语言</legend>
              <label className="radio-label"><input defaultChecked name="language" type="radio" value="zh" />中文</label>
              <label className="radio-label"><input name="language" type="radio" value="en" />English</label>
            </fieldset>
            <label>
              <span>简短留言（可选）</span>
              <textarea name="message" rows="5" />
            </label>
            <label className="consent">
              <input name="consent" required type="checkbox" />
              <span>我同意将以上信息仅用于本次简历获取与联系。</span>
            </label>
            {error ? <p className="form-error" id="resume-error" role="alert">{error}</p> : null}
            <button className="button button-primary submit-resume" disabled={state === "submitting"} type="submit">
              {state === "submitting" ? "正在验证..." : "提交信息并获取简历"}
              <ArrowRight size={18} />
            </button>
            <p className="privacy-note">
              当前为本地交互版本，不会向外部服务发送信息。正式部署后可接入邮件通知与限时下载链接。
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
