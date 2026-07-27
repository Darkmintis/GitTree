import { TreeTheme, ThemeName } from '@shared/types';

const themes: Record<ThemeName, TreeTheme> = {
  oak: {
    name: 'oak',
    label: 'Oak',
    trunk: { primary: '#6D4C41', secondary: '#3E2723' },
    branch: { primary: '#8D6E63', secondary: '#5D4037' },
    leaves: {
      recent: '#81C784',
      young: '#66BB6A',
      mature: '#43A047',
      old: '#2E7D32',
      stale: '#827717',
    },
    flowers: { petal: '#FFCC80', center: '#FFE0B2' },
    fruits: { open: '#FF7043', merged: '#66BB6A', closed: '#9E9E9E' },
    ground: '#3E5C2E',
    grass: '#4CAF50',
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
    leaves: {
      recent: '#FCE4EC',
      young: '#F8BBD0',
      mature: '#F48FB1',
      old: '#EC407A',
      stale: '#AD1457',
    },
    flowers: { petal: '#FCE4EC', center: '#F8BBD0' },
    fruits: { open: '#E91E63', merged: '#C2185B', closed: '#9C27B0' },
    ground: '#5D4037',
    grass: '#81C784',
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
      recent: '#A5D6A7',
      young: '#66BB6A',
      mature: '#2E7D32',
      old: '#1B5E20',
      stale: '#33691E',
    },
    flowers: { petal: '#C8E6C9', center: '#E8F5E9' },
    fruits: { open: '#8D6E63', merged: '#558B2F', closed: '#795548' },
    ground: '#2E4A22',
    grass: '#388E3C',
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
