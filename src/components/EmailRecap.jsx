import { useState } from 'react';
import useStore from '../store/useStore';

export default function EmailRecap() {
  const { generatedMenu, preferences } = useStore();
  const [emailAddress, setEmailAddress] = useState('');
  const [copied, setCopied] = useState(false);

  if (!generatedMenu || generatedMenu.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-3">📧</p>
          <p>Générez d'abord un menu !</p>
        </div>
      </div>
    );
  }

  const MEAL_NAMES = { breakfast: 'matin', lunch: 'midi', dinner: 'soir' };

  const buildEmailBody = () => {
    let body = `🍽️ MON PLANNING REPAS — ${generatedMenu.length} jours\n\n`;
    body += `👥 ${preferences.people} personne${preferences.people > 1 ? 's' : ''} | Style : ${preferences.cuisineStyle}\n\n`;

    generatedMenu.forEach((day) => {
      body += `📅 Jour ${day.day} — ${day.dayName} ${day.date}\n`;
      if (preferences.mealsPerDay === 3 && day.breakfast) {
        body += `  ☀️ Matin : ${day.breakfast.name}\n`;
      }
      if (day.lunch) body += `  🌤️ Midi : ${day.lunch.name}\n`;
      if (day.dinner) body += `  🌙 Soir : ${day.dinner.name}\n`;
      body += '\n';
    });

    body += `---\n`;
    body += `Budget : ${preferences.budget}€ | Généré avec Menu Planner`;
    return body;
  };

  const emailBody = buildEmailBody();

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBody).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleMailto = () => {
    const subject = encodeURIComponent(`Mon planning repas — ${generatedMenu.length} jours`);
    const body = encodeURIComponent(emailBody);
    const to = emailAddress || '';
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-emerald-400">📧 Récap email</h2>
        <p className="text-gray-400 text-sm">Partagez votre planning par email</p>
      </div>

      {/* Email input */}
      <div className="bg-[#1a1a1a] rounded-2xl p-4 mb-4">
        <label className="block text-sm font-semibold text-gray-400 mb-2">
          Destinataire (optionnel)
        </label>
        <input
          type="email"
          placeholder="email@exemple.com"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
          className="w-full bg-[#2a2a2a] text-white rounded-xl px-4 py-2 border border-gray-700 focus:border-emerald-500 focus:outline-none placeholder-gray-600"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleMailto}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-2xl transition-all"
        >
          📤 Envoyer par email
        </button>
        <button
          onClick={handleCopy}
          className={`flex-1 font-semibold py-3 rounded-2xl transition-all ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-300 border border-gray-700'
          }`}
        >
          {copied ? '✅ Copié !' : '📋 Copier'}
        </button>
      </div>

      {/* Preview */}
      <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
          <span className="text-emerald-400">✉️</span>
          <span className="text-sm font-semibold text-gray-300">Aperçu</span>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {generatedMenu.map((day) => (
            <div key={day.day} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-400 font-bold text-sm">Jour {day.day}</span>
                <span className="text-gray-400 text-sm">— {day.dayName} {day.date}</span>
              </div>
              <div className="space-y-1 pl-2">
                {preferences.mealsPerDay === 3 && day.breakfast && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>☀️</span>
                    <span className="text-gray-400">Matin :</span>
                    <span className="text-white">{day.breakfast.name}</span>
                  </div>
                )}
                {day.lunch && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>🌤️</span>
                    <span className="text-gray-400">Midi :</span>
                    <span className="text-white">{day.lunch.name}</span>
                  </div>
                )}
                {day.dinner && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>🌙</span>
                    <span className="text-gray-400">Soir :</span>
                    <span className="text-white">{day.dinner.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Jours', value: generatedMenu.length, icon: '📅' },
          { label: 'Personnes', value: preferences.people, icon: '👥' },
          { label: 'Budget', value: `${preferences.budget}€`, icon: '💶' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1a1a1a] rounded-2xl p-3 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
