// Kid-facing words for Feelings Fishing in English and three home languages.
// Feelings are nouns in Spanish, French and Chinese so sentences don't need
// gendered adjectives (Leo, Ava). Translations should be checked by a native
// speaker before classroom use.
import type { Feeling } from "@/components/FeelingsFishing";

export type Lang = "en" | "es" | "fr" | "zh";

export interface Pack {
  label: string; // shown in the language picker
  speech: string; // BCP-47 tag for read-aloud
  feeling: Record<Feeling, string>;
  stories: { story: string; why: string }[]; // same order as the game's rounds
  storyOf: (n: number, total: number) => string;
  ask: (name: string) => string;
  yes: (name: string, f: string) => string;
  missTry: (name: string, f: string) => string;
  missHint: (f: string) => string;
  shareTitle: string;
  actTitle: string;
  share: (f: string, partner: boolean) => string;
  act: (f: string, partner: boolean) => string;
  shared: string;
  next: string;
  finish: string;
}

export const PACKS: Record<Lang, Pack> = {
  en: {
    label: "English",
    speech: "en-US",
    feeling: {
      happy: "happy",
      sad: "sad",
      angry: "angry",
      scared: "scared",
      surprised: "surprised",
      proud: "proud",
    },
    stories: [
      {
        story: "Leo's block tower fell down right before he finished it.",
        why: "He worked hard on it, and now it's gone.",
      },
      {
        story: "Ava's grandma came to pick her up from school as a surprise!",
        why: "She didn't know Grandma was coming, and she loves her.",
      },
      {
        story: "Sam has to sing a song alone in front of the whole class.",
        why: "Doing something new with everyone watching can feel scary.",
      },
      {
        story: "Zara tied her shoes all by herself for the very first time.",
        why: "She kept practising until she could do it.",
      },
      {
        story: "Someone took Omar's turn on the swing without asking.",
        why: "It wasn't fair, and he was waiting for his turn.",
      },
    ],
    storyOf: (n, t) => `Story ${n} of ${t}`,
    ask: (name) => `How might ${name} feel? Catch that feeling!`,
    yes: (name, f) => `Yes! ${name} might feel ${f}.`,
    missTry: (name, f) => `Would ${name} feel ${f}? Try another fish.`,
    missHint: (f) => `Hmm, maybe not ${f}. Look for the glowing fish.`,
    shareTitle: "Share it",
    actTitle: "Act it out",
    share: (f, p) =>
      p
        ? `Tell your partner about a time you felt ${f}. What happened? Then listen to their story.`
        : `Think about a time you felt ${f}. What happened? What helped?`,
    act: (f, p) =>
      p
        ? `Make a ${f} face and body. Can your partner guess the feeling? Then swap.`
        : `Show a ${f} face in a mirror, or to your teacher. What does your body do?`,
    shared: "We shared",
    next: "Next story",
    finish: "Finish",
  },
  es: {
    label: "Español",
    speech: "es-ES",
    feeling: {
      happy: "alegría",
      sad: "tristeza",
      angry: "enojo",
      scared: "miedo",
      surprised: "sorpresa",
      proud: "orgullo",
    },
    stories: [
      {
        story: "La torre de bloques de Leo se cayó justo antes de terminarla.",
        why: "Trabajó mucho en ella y ahora ya no está.",
      },
      {
        story: "¡La abuela de Ava vino a recogerla a la escuela por sorpresa!",
        why: "No sabía que su abuela venía, y la quiere mucho.",
      },
      {
        story: "Sam tiene que cantar una canción solo delante de toda la clase.",
        why: "Hacer algo nuevo mientras todos miran puede dar miedo.",
      },
      {
        story: "Zara se ató los zapatos ella sola por primera vez.",
        why: "Siguió practicando hasta que pudo hacerlo.",
      },
      {
        story: "Alguien le quitó el turno en el columpio a Omar sin preguntar.",
        why: "No fue justo, y él estaba esperando su turno.",
      },
    ],
    storyOf: (n, t) => `Historia ${n} de ${t}`,
    ask: (name) => `¿Qué podría sentir ${name}? ¡Pesca ese sentimiento!`,
    yes: (name, f) => `¡Sí! ${name} podría sentir ${f}.`,
    missTry: (name, f) => `¿${name} sentiría ${f}? Prueba con otro pez.`,
    missHint: (f) => `Mmm, quizás no ${f}. Busca el pez que brilla.`,
    shareTitle: "Cuéntalo",
    actTitle: "Actúalo",
    share: (f, p) =>
      p
        ? `Cuéntale a tu compañero o compañera sobre una vez que sentiste ${f}. ¿Qué pasó? Luego escucha su historia.`
        : `Piensa en una vez que sentiste ${f}. ¿Qué pasó? ¿Qué te ayudó?`,
    act: (f, p) =>
      p
        ? `Muestra ${f} con tu cara y tu cuerpo. ¿Tu compañero o compañera puede adivinar el sentimiento? Luego cambien.`
        : `Muestra ${f} con tu cara frente a un espejo o a tu maestro. ¿Qué hace tu cuerpo?`,
    shared: "Ya lo contamos",
    next: "Siguiente historia",
    finish: "Terminar",
  },
  fr: {
    label: "Français",
    speech: "fr-FR",
    feeling: {
      happy: "joie",
      sad: "tristesse",
      angry: "colère",
      scared: "peur",
      surprised: "surprise",
      proud: "fierté",
    },
    stories: [
      {
        story: "La tour de blocs de Leo est tombée juste avant qu'il la finisse.",
        why: "Il y a beaucoup travaillé, et maintenant elle n'est plus là.",
      },
      {
        story: "La grand-mère d'Ava est venue la chercher à l'école par surprise !",
        why: "Elle ne savait pas que sa grand-mère venait, et elle l'aime beaucoup.",
      },
      {
        story: "Sam doit chanter une chanson tout seul devant toute la classe.",
        why: "Faire quelque chose de nouveau devant tout le monde peut faire peur.",
      },
      {
        story: "Zara a attaché ses lacets toute seule pour la première fois.",
        why: "Elle s'est entraînée jusqu'à y arriver.",
      },
      {
        story: "Quelqu'un a pris le tour d'Omar à la balançoire sans demander.",
        why: "Ce n'était pas juste, et il attendait son tour.",
      },
    ],
    storyOf: (n, t) => `Histoire ${n} sur ${t}`,
    ask: (name) => `Que pourrait ressentir ${name} ? Attrape ce sentiment !`,
    yes: (name, f) => `Oui ! ${name} pourrait ressentir de la ${f}.`,
    missTry: (name, f) => `Est-ce que ${name} ressentirait de la ${f} ? Essaie un autre poisson.`,
    missHint: (f) => `Hum, peut-être pas de la ${f}. Cherche le poisson qui brille.`,
    shareTitle: "Raconte",
    actTitle: "Mime-le",
    share: (f, p) =>
      p
        ? `Raconte à ton ou ta partenaire un moment où tu as ressenti de la ${f}. Que s'est-il passé ? Puis écoute son histoire.`
        : `Pense à un moment où tu as ressenti de la ${f}. Que s'est-il passé ? Qu'est-ce qui t'a aidé ?`,
    act: (f, p) =>
      p
        ? `Montre de la ${f} avec ton visage et ton corps. Est-ce que ton ou ta partenaire devine le sentiment ? Puis changez de rôle.`
        : `Montre de la ${f} avec ton visage, devant un miroir ou ton enseignant. Que fait ton corps ?`,
    shared: "On a raconté",
    next: "Histoire suivante",
    finish: "Terminer",
  },
  zh: {
    label: "中文",
    speech: "zh-CN",
    feeling: {
      happy: "开心",
      sad: "难过",
      angry: "生气",
      scared: "害怕",
      surprised: "惊讶",
      proud: "自豪",
    },
    stories: [
      { story: "Leo 的积木塔在快要搭好的时候倒了。", why: "他花了很多心思搭，现在塔没了。" },
      {
        story: "Ava 的奶奶给了她一个惊喜，来学校接她放学！",
        why: "她不知道奶奶会来，而且她很爱奶奶。",
      },
      { story: "Sam 要在全班同学面前一个人唱歌。", why: "在大家面前做新的事情，可能会让人害怕。" },
      { story: "Zara 第一次自己系好了鞋带。", why: "她一直练习，直到学会为止。" },
      {
        story: "有人没问一声，就抢了 Omar 荡秋千的机会。",
        why: "这不公平，他一直在等着轮到自己。",
      },
    ],
    storyOf: (n, t) => `第 ${n} 个故事（共 ${t} 个）`,
    ask: (name) => `${name} 可能会有什么感受？快把这个感受钓上来！`,
    yes: (name, f) => `对！${name} 可能会觉得${f}。`,
    missTry: (name, f) => `${name} 会觉得${f}吗？再试试别的鱼。`,
    missHint: (f) => `嗯，可能不是${f}。找找发光的那条鱼。`,
    shareTitle: "说一说",
    actTitle: "演一演",
    share: (f, p) =>
      p
        ? `跟你的同伴说说你觉得${f}的一次经历。发生了什么？然后听听同伴的故事。`
        : `想一想你觉得${f}的一次经历。发生了什么？什么帮助了你？`,
    act: (f, p) =>
      p
        ? `用你的表情和身体演出${f}的样子。你的同伴能猜出是什么感受吗？然后交换。`
        : `对着镜子或老师做出${f}的表情。你的身体有什么变化？`,
    shared: "我们说完了",
    next: "下一个故事",
    finish: "完成",
  },
};

/** Read text aloud with the device's own voices. Does nothing where unsupported. */
export function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.9;
  const voice = synth
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  if (voice) u.voice = voice;
  synth.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
