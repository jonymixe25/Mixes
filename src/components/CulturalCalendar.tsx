import { Calendar, Music, Users, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";

const EVENTS = [
  {
    id: 1,
    date: "2026-03-20",
    type: "event_concert",
    location: "CECAM, Tlahuitoltepec",
    title: "Concierto de Primavera",
  },
  {
    id: 2,
    date: "2026-04-15",
    type: "event_fiesta",
    location: "Plaza Central, Ayutla",
    title: "Fiesta de la Comunidad",
  },
  {
    id: 3,
    date: "2026-05-01",
    type: "event_assembly",
    location: "Palacio Municipal",
    title: "Asamblea General",
  },
];

export default function CulturalCalendar() {
  const { tf } = useLanguage();

  return (
    <div className="bg-brand-surface border border-white/5 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-brand-secondary/20 text-brand-secondary rounded-2xl">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{tf("calendar_title")}</h3>
          <p className="text-sm text-neutral-500">{tf("calendar_subtitle")}</p>
        </div>
      </div>

      <div className="space-y-4">
        {EVENTS.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
          >
            <div className="flex flex-col items-center justify-center w-16 h-16 bg-brand-bg rounded-xl border border-white/5">
              <span className="text-xs font-bold text-brand-primary uppercase">
                {new Date(event.date).toLocaleDateString("es-MX", { month: "short" })}
              </span>
              <span className="text-xl font-bold text-white">
                {new Date(event.date).getDate()}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1">
                {event.type === "event_concert" && <Music className="w-3 h-3" />}
                {event.type === "event_fiesta" && <MapPin className="w-3 h-3" />}
                {event.type === "event_assembly" && <Users className="w-3 h-3" />}
                {tf(event.type)}
              </div>
              <h4 className="text-white font-semibold group-hover:text-brand-primary transition-colors">
                {event.title}
              </h4>
              <p className="text-xs text-neutral-500">{event.location}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
