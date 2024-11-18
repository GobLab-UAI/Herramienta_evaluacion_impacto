declare module 'html2pdf.js' {
    const html2pdf: {
      (): {
        from: (element: HTMLElement) => {
          save: () => void;
        };
        set: (options: any) => any;
      };
    };
    export default html2pdf;
  }