import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { GMCPModule } from '@/lib/gmcp';

export interface CharSkill {
    id: string;
    name: string;
    level: number;
}

export interface CharSpell {
    id: string;
    name: string;
    description: string;
    school: string;
    type: string;
    cost: number;
}

export const useCharStore = defineStore('char', () => {
    // Char.Info
    const name = ref('');
    const charClass = ref('');
    const race = ref('');
    const alignment = ref('');
    const level = ref(0);

    // Char.Vitals
    const hp = ref(0);
    const hpMax = ref(0);
    const sp = ref(0);
    const spMax = ref(0);

    // Char.Stats
    const strength = ref(0);
    const speed = ref(0);
    const smarts = ref(0);
    const vitality = ref(0);
    const mysticism = ref(0);
    const perception = ref(0);

    // Char.Skills / Char.Spells
    const skills = reactive<CharSkill[]>([]);
    const spells = reactive<CharSpell[]>([]);

    // Char.Worth
    const xp = ref(0);
    const tnl = ref(0);
    const gold = ref(0);
    const skillPoints = ref(0);
    const trainingPoints = ref(0);

    function applyInfo(i: { name?: string; class?: string; race?: string; alignment?: string; level?: number }) {
        if (i.name !== undefined) name.value = i.name;
        if (i.class !== undefined) charClass.value = i.class;
        if (i.race !== undefined) race.value = i.race;
        if (i.alignment !== undefined) alignment.value = i.alignment;
        if (i.level !== undefined) level.value = i.level;
    }

    function applyVitals(v: { hp?: number; hp_max?: number; sp?: number; sp_max?: number }) {
        if (v.hp !== undefined) hp.value = v.hp;
        if (v.hp_max !== undefined) hpMax.value = v.hp_max;
        if (v.sp !== undefined) sp.value = v.sp;
        if (v.sp_max !== undefined) spMax.value = v.sp_max;
    }

    function applyStats(s: { strength?: number; speed?: number; smarts?: number; vitality?: number; mysticism?: number; perception?: number }) {
        if (s.strength !== undefined) strength.value = s.strength;
        if (s.speed !== undefined) speed.value = s.speed;
        if (s.smarts !== undefined) smarts.value = s.smarts;
        if (s.vitality !== undefined) vitality.value = s.vitality;
        if (s.mysticism !== undefined) mysticism.value = s.mysticism;
        if (s.perception !== undefined) perception.value = s.perception;
    }

    function applyWorth(w: { xp?: number; tnl?: number; gold_carry?: number; skillpoints?: number; trainingpoints?: number }) {
        if (w.xp !== undefined) xp.value = w.xp;
        if (w.tnl !== undefined) tnl.value = w.tnl;
        if (w.gold_carry !== undefined) gold.value = w.gold_carry;
        if (w.skillpoints !== undefined) skillPoints.value = w.skillpoints;
        if (w.trainingpoints !== undefined) trainingPoints.value = w.trainingpoints;
    }

    function applySkills(data: CharSkill[]) {
        skills.splice(0, skills.length, ...data);
    }

    function applySpells(data: CharSpell[]) {
        spells.splice(0, spells.length, ...data);
    }

    function handleGMCP(module: GMCPModule, payload: unknown) {
        if (module === GMCPModule.Char) {
            const data = payload as {
                Info?: Parameters<typeof applyInfo>[0];
                Vitals?: Parameters<typeof applyVitals>[0];
                Stats?: Parameters<typeof applyStats>[0];
                Worth?: Parameters<typeof applyWorth>[0];
                Skills?: CharSkill[];
                Spells?: CharSpell[];
            };
            if (data.Info) applyInfo(data.Info);
            if (data.Vitals) applyVitals(data.Vitals);
            if (data.Stats) applyStats(data.Stats);
            if (data.Worth) applyWorth(data.Worth);
            if (data.Skills) applySkills(data.Skills);
            if (data.Spells) applySpells(data.Spells);
        } else if (module === GMCPModule.CharInfo) {
            applyInfo(payload as Parameters<typeof applyInfo>[0]);
        } else if (module === GMCPModule.CharVitals) {
            applyVitals(payload as Parameters<typeof applyVitals>[0]);
        } else if (module === GMCPModule.CharStats) {
            applyStats(payload as Parameters<typeof applyStats>[0]);
        } else if (module === GMCPModule.CharWorth) {
            applyWorth(payload as Parameters<typeof applyWorth>[0]);
        } else if (module === GMCPModule.CharSkills) {
            applySkills(payload as CharSkill[]);
        } else if (module === GMCPModule.CharSpells) {
            applySpells(payload as CharSpell[]);
        }
    }

    return {
        name, charClass, race, alignment, level,
        hp, hpMax, sp, spMax,
        strength, speed, smarts, vitality, mysticism, perception,
        xp, tnl, gold, skillPoints, trainingPoints,
        skills, spells,
        handleGMCP,
    };
});
