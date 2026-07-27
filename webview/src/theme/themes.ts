import { TreeTheme, ThemeName } from '@shared/types';

/** Natural leaf greens shared across themes (flowers/fruits still theme-specific). */
const realGreens = {
  recent: '#7CB342',
  young: '#66BB6A',
  mature: '#43A047',
  old: '#2E7D32',
  stale: '#558B2F',
};

const themes: Record<ThemeName, TreeTheme> = {
  oak: {
    name: 'oak',
    label: 'Oak',
    trunk: { primary: '#6D4C41', secondary: '#3E2723' },
    branch: { primary: '#8D6E63', secondary: '#5D4037' },
    leaves: { ...realGreens },
    flowers: { petal: '#FFCC80', center: '#FFE0B2' },
    fruits: { open: '#FF7043', merged: '#66BB6A', closed: '#9E9E9E' },
    ground: '#4CAF50',
    grass: '#66BB6A',
    sky: {
      turbidity: 4,
      rayleigh: 1.2,
      mieCoefficient: 0.004,
      sunPosition: [80, 40, -30],
    },
    accent: '#4CAF50',
    text: { primary: '#FFFFFF', secondary: '#E8F5E9', muted: 'rgba(255,255,255,0.55)' },
    overlay: { bg: 'rgba(12, 28, 18, 0.72)', border: 'rgba(76, 175, 80, 0.35)' },
  },

  sakura: {
    name: 'sakura',
    label: 'Sakura',
    trunk: { primary: '#8D6E63', secondary: '#5D4037' },
    branch: { primary: '#A1887F', secondary: '#6D4C41' },
    leaves: { ...realGreens },
    flowers: { petal: '#FCE4EC', center: '#F8BBD0' },
    fruits: { open: '#E91E63', merged: '#C2185B', closed: '#9C27B0' },
    ground: '#4CAF50',
    grass: '#66BB6A',
    sky: {
      turbidity: 6,
      rayleigh: 1.5,
      mieCoefficient: 0.005,
      sunPosition: [60, 35, -40],
    },
    accent: '#EC407A',
    text: { primary: '#FFFFFF', secondary: '#FCE4EC', muted: 'rgba(255,255,255,0.55)' },
    overlay: { bg: 'rgba(40, 16, 28, 0.72)', border: 'rgba(236, 64, 122, 0.35)' },
  },

  pine: {
    name: 'pine',
    label: 'Pine',
    trunk: { primary: '#4E342E', secondary: '#3E2723' },
    branch: { primary: '#5D4037', secondary: '#3E2723' },
    leaves: {
      recent: '#8BC34A',
      young: '#689F38',
      mature: '#558B2F',
      old: '#33691E',
      stale: '#1B5E20',
    },
    flowers: { petal: '#C8E6C9', center: '#E8F5E9' },
    fruits: { open: '#8D6E63', merged: '#558B2F', closed: '#795548' },
    ground: '#4CAF50',
    grass: '#66BB6A',
    sky: {
      turbidity: 3.5,
      rayleigh: 1.0,
      mieCoefficient: 0.003,
      sunPosition: [90, 45, -20],
    },
    accent: '#66BB6A',
    text: { primary: '#FFFFFF', secondary: '#E8F5E9', muted: 'rgba(255,255,255,0.55)' },
    overlay: { bg: 'rgba(10, 28, 14, 0.72)', border: 'rgba(102, 187, 106, 0.35)' },
  },
};

export function getTheme(name: ThemeName): TreeTheme {
  return themes[name] || themes.oak;
}

export function getAllThemes(): [ThemeName, TreeTheme][] {
  return Object.entries(themes) as [ThemeName, TreeTheme][];
}

export default themes;
