/**
 * CSS import 관리 유틸리티
 * 컴포넌트에서 필요한 CSS를 동적으로 import할 수 있도록 도와주는 함수들
 */

// 카드 관련 CSS import
export const importCardStyles = async () => {
  if (typeof window !== 'undefined') {
    await import('../components/cards/all-cards.css').catch((e) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('카드 CSS 파일을 찾을 수 없습니다:', e);
      }
    });
  }
};
export const importSpecificCardStyle = (rarity: string) => {
  if (typeof window !== 'undefined') {
    import(`../components/cards/css/${rarity}.css`);
  }
};

// CSS import 목록
export const CSS_IMPORTS = {
  CARDS: '../components/cards/all-cards.css',
  GLOBALS: '../app/globals.css',
} as const;

// 동적 CSS import 함수
export const dynamicCSSImport = (cssPath: string) => {
  if (typeof window !== 'undefined') {
    import(cssPath);
  }
};
