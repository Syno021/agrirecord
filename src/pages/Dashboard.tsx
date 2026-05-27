import { motion } from 'framer-motion';
import { CloudSun, Leaf, Map, AlertTriangle, CheckCircle2 } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: -8 },
};

const pageTransition = { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const };

const stats = [
  { label: 'Active Farms', value: '3', icon: Map, trend: null },
  { label: 'Harvest Yield', value: '2,400', unit: 'kg', icon: Leaf, trend: '↑ 12%' },
  { label: 'Tasks Due', value: '7', icon: CheckCircle2, trend: null },
  { label: 'Alerts', value: '2', icon: AlertTriangle, trend: '↓ 3%', down: true },
];

const activities = [
  { title: 'Fertilizer applied', farm: 'Sunrise Farm', time: '2h ago' },
  { title: 'Irrigation completed', farm: 'Green Valley', time: '5h ago' },
  { title: 'Soil sample collected', farm: 'Sunrise Farm', time: 'Yesterday' },
];

export default function Dashboard() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      <h1 className="font-display text-3xl font-bold text-brand-primary">
        Good morning, James 👋
      </h1>
      <p className="mt-1 text-sm text-brand-muted-foreground">
        Thursday, 15 May · Nairobi
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[20px] border border-brand-border bg-brand-surface p-4 shadow-card"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
                <stat.icon className="h-5 w-5 text-brand-primary" />
              </div>
              {stat.trend ? (
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    stat.down
                      ? 'bg-red-100 text-brand-danger'
                      : 'bg-brand-accent-light/40 text-brand-primary'
                  }`}
                >
                  {stat.trend}
                </span>
              ) : null}
            </div>
            <p className="font-display text-3xl font-bold text-brand-primary">
              {stat.value}
              {stat.unit ? (
                <span className="text-sm font-normal text-brand-muted-foreground">
                  {' '}
                  {stat.unit}
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-brand-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[20px] bg-gradient-to-br from-brand-primary to-brand-secondary p-5 text-white shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-4xl font-bold">24°</p>
            <p className="text-sm text-brand-accent-light">Partly cloudy</p>
          </div>
          <CloudSun className="h-12 w-12 opacity-90" />
        </div>
        <p className="mt-4 text-xs text-white/70">
          Humidity 68% · Wind 12 km/h · UV 6
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Recent Activity</h2>
        <button type="button" className="text-sm font-semibold text-brand-accent">
          See all →
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {activities.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-[20px] border border-brand-border bg-brand-surface p-4 shadow-card"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
              <Leaf className="h-5 w-5 text-brand-primary" />
            </div>
            <div>
              <p className="font-display font-semibold">{item.title}</p>
              <p className="text-sm text-brand-muted-foreground">
                {item.farm} · {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
