import { TreeTheme, ThemeName } from '@shared/types';

const themes: Record<ThemeName, TreeTheme> = {
  oak: {
    name: 'oak',
    label: 'Default Oak',
    trunk: { primary: '#5D4037', secondary: '#3E2723', gradient: ['#5D4037', '#4E342E', '#3E2723'] },
    branch: { primary: '#6D4C41', secondary: '#4E342E', gradient: ['#6D4C41', '#5D4037', '#4E342E'] },
    leaves: { recent: '#66BB6A', young: '#43A047', mature: '#2E7D32', old: '#827717', stale: '#A1887F', gradient: ['#66BB6A', '#43A047', '#2E7D32', '#827717', '#A1887F'] },
    flowers: { petal: '#FFAB91', center: '#FFE0B2', gradient: ['#FFAB91', '#FFCC80', '#FFE0B2'] },
    fruits: { open: '#FF7043', merged: '#4CAF50', closed: '#9E9E9E' },
    background: {
      primary: '#0D1117', secondary: '#161B22', gradient: true,
      sky: ['#1a3a2a', '#0a1a12', '#0D1117'],
      ground: ['#1B5E20', '#2E7D32', '#388E3C'],
    },
    ground: '#1B5E20',
    effects: { particles: '#A5D6A7', glow: '#4CAF50', wind: true },
    accent: '#4CAF50',
    text: { primary: '#E8F5E9', secondary: '#A5D6A7', muted: '#484F58' },
  },

  sakura: {
    name: 'sakura',
    label: 'Sakura',
    trunk: { primary: '#8D6E63', secondary: '#5D4037', gradient: ['#8D6E63', '#6D4C41', '#5D4037'] },
    branch: { primary: '#A1887F', secondary: '#6D4C41', gradient: ['#A1887F', '#8D6E63', '#6D4C41'] },
    leaves: { recent: '#F8BBD0', young: '#F48FB1', mature: '#EC407A', old: '#AD1457', stale: '#8E24AA', gradient: ['#F8BBD0', '#F48FB1', '#EC407A', '#AD1457', '#8E24AA'] },
    flowers: { petal: '#FCE4EC', center: '#F8BBD0', gradient: ['#FCE4EC', '#F8BBD0', '#F48FB1'] },
    fruits: { open: '#E91E63', merged: '#C2185B', closed: '#9C27B0' },
    background: {
      primary: '#1A0D14', secondary: '#2D1424', gradient: true,
      sky: ['#2D1424', '#1A0D14', '#0D050A'],
      ground: ['#4A148C', '#6A1B9A', '#7B1FA2'],
    },
    ground: '#4A148C',
    effects: { particles: '#F48FB1', glow: '#EC407A', wind: true },
    accent: '#EC407A',
    text: { primary: '#FCE4EC', secondary: '#F8BBD0', muted: '#6A1B9A' },
  },

  pine: {
    name: 'pine',
    label: 'Pine',
    trunk: { primary: '#4E342E', secondary: '#3E2723', gradient: ['#4E342E', '#3E2723', '#2C1A12'] },
    branch: { primary: '#5D4037', secondary: '#3E2723', gradient: ['#5D4037', '#4E342E', '#3E2723'] },
    leaves: { recent: '#81C784', young: '#4CAF50', mature: '#2E7D32', old: '#1B5E20', stale: '#33691E', gradient: ['#81C784', '#4CAF50', '#2E7D32', '#1B5E20', '#33691E'] },
    flowers: { petal: '#A5D6A7', center: '#E8F5E9', gradient: ['#A5D6A7', '#C8E6C9', '#E8F5E9'] },
    fruits: { open: '#795548', merged: '#33691E', closed: '#558B2F' },
    background: {
      primary: '#0A1C0A', secondary: '#0F2A0F', gradient: true,
      sky: ['#0F2A0F', '#0A1C0A', '#050D05'],
      ground: ['#1B5E20', '#2E7D32', '#388E3C'],
    },
    ground: '#1B5E20',
    effects: { particles: '#81C784', glow: '#4CAF50', wind: false },
    accent: '#4CAF50',
    text: { primary: '#E8F5E9', secondary: '#A5D6A7', muted: '#2E7D32' },
  },

  maple: {
    name: 'maple',
    label: 'Maple',
    trunk: { primary: '#3E2723', secondary: '#1B0F0A', gradient: ['#3E2723', '#2C1A12', '#1B0F0A'] },
    branch: { primary: '#4E342E', secondary: '#2C1A12', gradient: ['#4E342E', '#3E2723', '#2C1A12'] },
    leaves: { recent: '#FF8A65', young: '#FF7043', mature: '#FF5722', old: '#BF360C', stale: '#4E342E', gradient: ['#FF8A65', '#FF7043', '#FF5722', '#BF360C', '#4E342E'] },
    flowers: { petal: '#FFAB91', center: '#FFCCBC', gradient: ['#FFAB91', '#FFCCBC', '#FFE0B2'] },
    fruits: { open: '#FF5722', merged: '#D84315', closed: '#8D6E63' },
    background: {
      primary: '#0D0D0D', secondary: '#1A1414', gradient: true,
      sky: ['#1A1414', '#0D0D0D', '#050303'],
      ground: ['#4E342E', '#3E2723', '#2C1A12'],
    },
    ground: '#4E342E',
    effects: { particles: '#FF8A65', glow: '#FF5722', wind: true },
    accent: '#FF5722',
    text: { primary: '#FBE9E7', secondary: '#FFAB91', muted: '#5D4037' },
  },

  fantasy: {
    name: 'fantasy',
    label: 'Fantasy',
    trunk: { primary: '#4A148C', secondary: '#1A0033', gradient: ['#4A148C', '#311B92', '#1A0033'] },
    branch: { primary: '#673AB7', secondary: '#311B92', gradient: ['#673AB7', '#4A148C', '#311B92'] },
    leaves: { recent: '#B388FF', young: '#7C4DFF', mature: '#651FFF', old: '#4A148C', stale: '#1A0033', gradient: ['#B388FF', '#7C4DFF', '#651FFF', '#4A148C', '#1A0033'] },
    flowers: { petal: '#E1BEE7', center: '#CE93D8', gradient: ['#E1BEE7', '#CE93D8', '#BA68C8'] },
    fruits: { open: '#FFD54F', merged: '#FFB300', closed: '#795548' },
    background: {
      primary: '#05001A', secondary: '#0D0033', gradient: true,
      sky: ['#0D0033', '#05001A', '#02000D'],
      ground: ['#1A0033', '#2D0050', '#3D0070'],
    },
    ground: '#1A0033',
    effects: { particles: '#B388FF', glow: '#7C4DFF', wind: true },
    accent: '#7C4DFF',
    text: { primary: '#EDE7F6', secondary: '#B388FF', muted: '#4A148C' },
  },

  cyber: {
    name: 'cyber',
    label: 'Cyber',
    trunk: { primary: '#00BCD4', secondary: '#006064', gradient: ['#00BCD4', '#0097A7', '#006064'] },
    branch: { primary: '#26C6DA', secondary: '#0097A7', gradient: ['#26C6DA', '#00BCD4', '#0097A7'] },
    leaves: { recent: '#69F0AE', young: '#00E676', mature: '#00C853', old: '#009624', stale: '#004D40', gradient: ['#69F0AE', '#00E676', '#00C853', '#009624', '#004D40'] },
    flowers: { petal: '#18FFFF', center: '#E0F7FA', gradient: ['#18FFFF', '#80DEEA', '#E0F7FA'] },
    fruits: { open: '#FF1744', merged: '#00E5FF', closed: '#536DFE' },
    background: {
      primary: '#001419', secondary: '#00222B', gradient: true,
      sky: ['#00222B', '#001419', '#000A0D'],
      ground: ['#004D40', '#00695C', '#00897B'],
    },
    ground: '#00BCD4',
    effects: { particles: '#18FFFF', glow: '#00BCD4', wind: false },
    accent: '#00E676',
    text: { primary: '#E0F7FA', secondary: '#80DEEA', muted: '#006064' },
  },

  pixel: {
    name: 'pixel',
    label: 'Pixel',
    trunk: { primary: '#5D4037', secondary: '#3E2723', gradient: ['#5D4037', '#4E342E', '#3E2723'] },
    branch: { primary: '#6D4C41', secondary: '#4E342E', gradient: ['#6D4C41', '#5D4037', '#4E342E'] },
    leaves: { recent: '#66BB6A', young: '#43A047', mature: '#2E7D32', old: '#827717', stale: '#A1887F', gradient: ['#66BB6A', '#43A047', '#2E7D32', '#827717', '#A1887F'] },
    flowers: { petal: '#FFAB91', center: '#FFE0B2', gradient: ['#FFAB91', '#FFCC80', '#FFE0B2'] },
    fruits: { open: '#FF7043', merged: '#4CAF50', closed: '#9E9E9E' },
    background: {
      primary: '#0D1117', secondary: '#161B22', gradient: false,
      sky: ['#161B22', '#0D1117', '#090C10'],
      ground: ['#2E7D32', '#388E3C', '#43A047'],
    },
    ground: '#2E7D32',
    effects: { particles: '#A5D6A7', glow: '#4CAF50', wind: false },
    accent: '#4CAF50',
    text: { primary: '#E8F5E9', secondary: '#A5D6A7', muted: '#484F58' },
  },

  minimal: {
    name: 'minimal',
    label: 'Minimal',
    trunk: { primary: '#616161', secondary: '#424242', gradient: ['#616161', '#525252', '#424242'] },
    branch: { primary: '#757575', secondary: '#545454', gradient: ['#757575', '#616161', '#545454'] },
    leaves: { recent: '#9E9E9E', young: '#757575', mature: '#616161', old: '#424242', stale: '#333333', gradient: ['#9E9E9E', '#757575', '#616161', '#424242', '#333333'] },
    flowers: { petal: '#E0E0E0', center: '#F5F5F5', gradient: ['#E0E0E0', '#EEEEEE', '#F5F5F5'] },
    fruits: { open: '#757575', merged: '#616161', closed: '#424242' },
    background: {
      primary: '#121212', secondary: '#1E1E1E', gradient: false,
      sky: ['#1E1E1E', '#121212', '#0A0A0A'],
      ground: ['#424242', '#545454', '#616161'],
    },
    ground: '#424242',
    effects: { particles: '#757575', glow: '#616161', wind: false },
    accent: '#9E9E9E',
    text: { primary: '#E0E0E0', secondary: '#9E9E9E', muted: '#616161' },
  },

  darkForest: {
    name: 'darkForest',
    label: 'Dark Forest',
    trunk: { primary: '#1B1B1B', secondary: '#0A0A0A', gradient: ['#1B1B1B', '#141414', '#0A0A0A'] },
    branch: { primary: '#2D2D2D', secondary: '#1A1A1A', gradient: ['#2D2D2D', '#1B1B1B', '#1A1A1A'] },
    leaves: { recent: '#00C853', young: '#009624', mature: '#1B5E20', old: '#0A1C0A', stale: '#000000', gradient: ['#00C853', '#009624', '#1B5E20', '#0A1C0A', '#000000'] },
    flowers: { petal: '#1B5E20', center: '#003300', gradient: ['#1B5E20', '#0D3B0D', '#003300'] },
    fruits: { open: '#FF6F00', merged: '#33691E', closed: '#1B1B1B' },
    background: {
      primary: '#000000', secondary: '#050A05', gradient: true,
      sky: ['#050A05', '#000000', '#000000'],
      ground: ['#003300', '#004D00', '#006600'],
    },
    ground: '#000000',
    effects: { particles: '#00C853', glow: '#00C853', wind: false },
    accent: '#00C853',
    text: { primary: '#00C853', secondary: '#009624', muted: '#003300' },
  },

  crystal: {
    name: 'crystal',
    label: 'Crystal',
    trunk: { primary: '#80DEEA', secondary: '#26C6DA', gradient: ['#80DEEA', '#4DD0E1', '#26C6DA'] },
    branch: { primary: '#B2EBF2', secondary: '#80DEEA', gradient: ['#B2EBF2', '#80DEEA', '#4DD0E1'] },
    leaves: { recent: '#E8F5E9', young: '#C8E6C9', mature: '#A5D6A7', old: '#81C784', stale: '#66BB6A', gradient: ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A'] },
    flowers: { petal: '#E0F7FA', center: '#FFFFFF', gradient: ['#E0F7FA', '#B2EBF2', '#80DEEA'] },
    fruits: { open: '#FF8A65', merged: '#80DEEA', closed: '#B2EBF2' },
    background: {
      primary: '#0A2025', secondary: '#103035', gradient: true,
      sky: ['#103035', '#0A2025', '#051015'],
      ground: ['#00838F', '#0097A7', '#00ACC1'],
    },
    ground: '#80DEEA',
    effects: { particles: '#80DEEA', glow: '#26C6DA', wind: true },
    accent: '#80DEEA',
    text: { primary: '#E0F7FA', secondary: '#80DEEA', muted: '#26C6DA' },
  },

  bonsai: {
    name: 'bonsai',
    label: 'Bonsai',
    trunk: { primary: '#8D6E63', secondary: '#5D4037', gradient: ['#8D6E63', '#6D4C41', '#5D4037'] },
    branch: { primary: '#A1887F', secondary: '#6D4C41', gradient: ['#A1887F', '#8D6E63', '#6D4C41'] },
    leaves: { recent: '#AED581', young: '#8BC34A', mature: '#689F38', old: '#33691E', stale: '#827717', gradient: ['#AED581', '#8BC34A', '#689F38', '#33691E', '#827717'] },
    flowers: { petal: '#F8BBD0', center: '#F48FB1', gradient: ['#F8BBD0', '#F48FB1', '#EC407A'] },
    fruits: { open: '#FFB300', merged: '#43A047', closed: '#8D6E63' },
    background: {
      primary: '#F5F0E8', secondary: '#EDE7D9', gradient: true,
      sky: ['#EDE7D9', '#E8E0CC', '#DFD5BD'],
      ground: ['#5D4037', '#6D4C41', '#795548'],
    },
    ground: '#5D4037',
    effects: { particles: '#AED581', glow: '#689F38', wind: true },
    accent: '#689F38',
    text: { primary: '#3E2723', secondary: '#5D4037', muted: '#8D6E63' },
  },
};

export function getTheme(name: ThemeName): TreeTheme {
  return themes[name] || themes.oak;
}

export function getAllThemes(): [ThemeName, TreeTheme][] {
  return Object.entries(themes) as [ThemeName, TreeTheme][];
}

export default themes;
