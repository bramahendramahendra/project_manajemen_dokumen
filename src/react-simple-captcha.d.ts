declare module 'react-simple-captcha' {
    interface SimpleCaptchaProps {
      onChange: (code: string) => void;
    }
  
    interface SimpleCaptcha {
      validate: (generatedCode: string, userInput: string) => boolean;
    }
  
    const SimpleCaptcha: React.FC<SimpleCaptchaProps> & SimpleCaptcha;
    export default SimpleCaptcha;
  }
  