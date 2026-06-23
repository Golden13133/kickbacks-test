import './App.css'

function App() {
  return (
    <div className="landing">
      <nav className="nav">
        <div className="nav-logo">Kickbacks</div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How it works</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#cta" className="btn btn-outline">Get started</a></li>
        </ul>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="badge">Now in beta</span>
          <h1>Reward your best customers, automatically</h1>
          <p className="hero-sub">
            Kickbacks makes it effortless to run referral and loyalty programs
            that actually drive growth — no engineering required.
          </p>
          <div className="hero-actions">
            <a href="#cta" className="btn btn-primary">Start for free</a>
            <a href="#how-it-works" className="btn btn-ghost">See how it works →</a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="card-mock">
            <div className="card-row"><span className="dot green" />Referral sent</div>
            <div className="card-row"><span className="dot blue" />Purchase confirmed</div>
            <div className="card-row"><span className="dot yellow" />Reward issued — $25</div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <h2>Everything you need to grow through word of mouth</h2>
        <div className="feature-grid">
          {[
            { icon: '⚡', title: 'Instant setup', desc: 'Go live in minutes with a no-code dashboard. No developers needed.' },
            { icon: '🎯', title: 'Flexible rewards', desc: 'Cash back, credits, discounts, or custom perks — you choose.' },
            { icon: '📊', title: 'Real-time analytics', desc: 'Track every referral, conversion, and reward in one place.' },
            { icon: '🔗', title: 'Easy integrations', desc: 'Works with Shopify, Stripe, and 50+ tools you already use.' },
            { icon: '🛡️', title: 'Fraud protection', desc: 'Built-in detection stops abuse before it costs you money.' },
            { icon: '💬', title: 'Automated emails', desc: 'Branded notifications keep customers engaged automatically.' },
          ].map(f => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <h2>Up and running in three steps</h2>
        <div className="steps">
          {[
            { n: '1', title: 'Create your program', desc: 'Set your reward rules and branding in the dashboard.' },
            { n: '2', title: 'Share the link', desc: 'Every customer gets a unique referral link to share.' },
            { n: '3', title: 'Rewards flow automatically', desc: 'We track conversions and pay out rewards without any manual work.' },
          ].map(s => (
            <div className="step" key={s.n}>
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="pricing">
        <h2>Simple, transparent pricing</h2>
        <div className="plans">
          {[
            {
              name: 'Starter', price: '$0', desc: 'Up to 100 referrals/mo',
              features: ['1 program', 'Email notifications', 'Basic analytics'],
              cta: 'Get started free', highlight: false,
            },
            {
              name: 'Growth', price: '$49', desc: 'per month',
              features: ['Unlimited referrals', 'Custom rewards', 'Advanced analytics', 'Integrations', 'Priority support'],
              cta: 'Start free trial', highlight: true,
            },
            {
              name: 'Enterprise', price: 'Custom', desc: 'contact us',
              features: ['Everything in Growth', 'Dedicated CSM', 'SLA guarantee', 'Custom contracts'],
              cta: 'Talk to sales', highlight: false,
            },
          ].map(p => (
            <div className={`plan${p.highlight ? ' plan-highlight' : ''}`} key={p.name}>
              {p.highlight && <div className="plan-badge">Most popular</div>}
              <div className="plan-name">{p.name}</div>
              <div className="plan-price">{p.price}</div>
              <div className="plan-desc">{p.desc}</div>
              <ul className="plan-features">
                {p.features.map(f => <li key={f}>✓ {f}</li>)}
              </ul>
              <a href="#cta" className={`btn ${p.highlight ? 'btn-primary' : 'btn-outline'}`}>{p.cta}</a>
            </div>
          ))}
        </div>
      </section>

      <section id="cta" className="cta">
        <h2>Ready to turn customers into advocates?</h2>
        <p>Join hundreds of businesses already growing with Kickbacks.</p>
        <form className="cta-form" onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="Enter your work email" required />
          <button type="submit" className="btn btn-primary">Get early access</button>
        </form>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Kickbacks. All rights reserved.</span>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  )
}

export default App
