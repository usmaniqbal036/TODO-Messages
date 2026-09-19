import { Link } from 'react-router-dom';
import {
  HiClipboardList,
  HiChat,
  HiChartBar,
  HiCalendar,
  HiArrowRight,
  HiCheck,
} from 'react-icons/hi';

const FEATURES = [
  {
    icon: HiClipboardList,
    title: 'Prioritised tasks',
    text: 'Mark every task Low, Medium or High, add a description and a due date, and edit it any time.',
  },
  {
    icon: HiCalendar,
    title: 'Deadlines that stand out',
    text: 'Overdue tasks are flagged in red, and you can sort your list by due date or priority.',
  },
  {
    icon: HiChat,
    title: 'Private messaging',
    text: 'Start a one-to-one chat with any registered user and see unread counts at a glance.',
  },
  {
    icon: HiChartBar,
    title: 'Progress at a glance',
    text: 'Your dashboard shows how many tasks are done and how many conversations are open.',
  },
];

const STEPS = [
  {
    title: 'Create your account',
    text: 'Sign up with your name, email and a password.',
  },
  {
    title: 'Add your tasks',
    text: 'Give each one a priority and, if you like, a description and due date.',
  },
  {
    title: 'Start a conversation',
    text: 'Pick anyone from the user list and send your first message.',
  },
];

const Landing = () => {
  return (
    <div className="lp">
      {}
      <section className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-copy">
            <span className="lp-eyebrow">Tasks and conversations, in one place</span>

            <h1 className="lp-title">
              Get things done.
              <br />
              <span className="lp-accent">Stay in touch.</span>
            </h1>

            <p className="lp-lead">
              Todo&amp;Chat pairs a simple task manager with private one-to-one messaging, so
              planning your work and following up on it happen in the same place.
            </p>

            <div className="lp-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get started <HiArrowRight />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Log in
              </Link>
            </div>

            <ul className="lp-checks">
              <li>
                <HiCheck /> Priorities and due dates
              </li>
              <li>
                <HiCheck /> Private one-to-one chat
              </li>
              <li>
                <HiCheck /> Works on desktop and mobile
              </li>
            </ul>
          </div>

          {}
          <div className="lp-preview-wrap" aria-hidden="true">
            <div className="lp-card lp-tasks">
              <div className="lp-card-head">
                <strong>My Todos</strong>
                <span className="lp-muted">2 of 4 done</span>
              </div>
              <div className="lp-progress">
                <span style={{ width: '50%' }} />
              </div>

              <div className="lp-task done">
                <span className="lp-box checked">
                  <HiCheck />
                </span>
                <span className="lp-task-title">Finish the project report</span>
                <span className="lp-chip high">High</span>
              </div>
              <div className="lp-task">
                <span className="lp-box" />
                <span className="lp-task-title">Review pull requests</span>
                <span className="lp-chip medium">Medium</span>
              </div>
              <div className="lp-task">
                <span className="lp-box" />
                <span className="lp-task-title">Book dentist appointment</span>
                <span className="lp-chip low">Low</span>
              </div>
              <div className="lp-task done">
                <span className="lp-box checked">
                  <HiCheck />
                </span>
                <span className="lp-task-title">Pay the electricity bill</span>
                <span className="lp-chip low">Low</span>
              </div>
            </div>

            <div className="lp-card lp-chat">
              <div className="lp-card-head">
                <span className="lp-avatar">A</span>
                <strong>Ali</strong>
              </div>
              <div className="lp-bubble received">Did you finish the report?</div>
              <div className="lp-bubble sent">Almost, sending it over now.</div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section id="features" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2>Two tools, one account</h2>
            <p>Everything you need to plan your day and talk it through.</p>
          </div>

          <div className="lp-features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <article key={title} className="lp-feature">
                <div className="lp-feature-icon">
                  <Icon />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {}
      <section id="how-it-works" className="lp-section lp-section-alt">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2>How it works</h2>
            <p>You can be up and running in a few minutes.</p>
          </div>

          <ol className="lp-steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="lp-step">
                <span className="lp-step-num">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-cta">
            <h2>Ready to get organised?</h2>
            <p>Create an account and add your first task today.</p>
            <div className="lp-actions lp-actions-center">
              <Link to="/register" className="btn btn-white btn-lg">
                Create your account <HiArrowRight />
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <span className="lp-footer-brand">
            <HiClipboardList /> Todo&amp;Chat
          </span>
          <span>© {new Date().getFullYear()} Todo&amp;Chat. Built with React, Node.js and MongoDB.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
