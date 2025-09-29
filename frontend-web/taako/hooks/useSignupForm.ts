'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { authenticationConfirmEmail, authenticationEmail, checkEmailDuplicate, checkNicknameDuplicate, signup } from "@/lib/auth/signup";

export function useSignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // 소셜
  const [isSocial, setIsSocial] = useState(false);
  const [providerName, setProviderName] = useState("");

  // 이메일 관련
  const [email, setEmail] = useState("");
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailConfirm, setEmailConfirm] = useState<boolean | null>(null);
  const [emailExpired, setEmailExpired] = useState<boolean | null>(null);
  
  // 인증번호 카운트다운 관련
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [formatted, setFormatted] = useState<string>("00:00");
  
  // 인증코드
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!expiredAt) return;

    // ISO 문자열에 나노초(최대 9자리)가 포함된 경우를 안전하게 파싱하여 ms 단위로 변환
    const parseIsoToMs = (input: string): number => {
      const match = input.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:?\d{2})?$/);
      if (match) {
        const base = match[1];
        const frac = (match[2] ?? '').slice(0, 3).padEnd(3, '0'); // ms로 보정
        const tz = match[3] ?? 'Z';
        const iso = frac ? `${base}.${frac}${tz}` : `${base}${tz}`;
        return new Date(iso).getTime();
      }
      // 기본 파싱 시도
      const t = new Date(input).getTime();
      return isNaN(t) ? 0 : t;
    };

    const endTime = parseIsoToMs(expiredAt);

    const update = () => {
      const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(diff);
      const minutes = Math.floor(diff / 60).toString().padStart(2, "0");
      const seconds = (diff % 60).toString().padStart(2, "0");
      setFormatted(`${minutes}:${seconds}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiredAt]);

  // 비밀번호 관련
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 비밀번호 형식 검사
  const isValidPassword = (password: string) => {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\/!@$~])[A-Za-z\d\/!@$~]{8,21}$/.test(password);
  };
  // 비밀번호 유효 여부
  const isPasswordValid = isValidPassword(password) && password === confirmPassword;

  let passwordErrorMessage: string | null = null;
  if (password && !isValidPassword(password)) {
    passwordErrorMessage = "비밀번호 형식이 올바르지 않습니다. (8~21자, 대문자/소문자/숫자/특수문자(!,@,$) 포함)";
  } else if (password && confirmPassword && password !== confirmPassword) {
    passwordErrorMessage = "비밀번호가 일치하지 않습니다.";
  }

  // 닉네임 관련
  const [nickname, setNickname] = useState("");
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [nicknameLoading, setNicknameLoading] = useState(false);

  // 닉네임 형식 검사: 영문/한글/숫자만 허용, 길이 2~10
  const isValidNickname = (value: string) => {
    const trimmed = value.trim();
    return /^[0-9A-Za-z가-힣]{2,10}$/.test(trimmed);
  };

  // 닉네임 입력 시 즉시 검증하여 메시지 표시
  useEffect(() => {
    if (!nickname) {
      setNicknameError(null);
      setIsNicknameAvailable(null); // 서버 체크 전 메시지 없애기
      return;
    }
  
    // 형식이 올바르지 않으면 빨간 경고
    if (!/^[0-9A-Za-z가-힣]{2,10}$/.test(nickname)) {
      setNicknameError("닉네임은 2~10자의 영문/한글/숫자만 가능합니다.");
      setIsNicknameAvailable(null); // 서버 체크 결과 초기화
    } else {
      setNicknameError(null); // 형식이 맞으면 에러 제거
      setIsNicknameAvailable(null); // 서버 체크 전까지는 사용 가능 메시지 X
    }
  }, [nickname]);

  // 이메일 형식 검사
  const isValidEmail = (email: string) => {
    const trimmed = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  // 이메일 중복 체크
  const handleCheckEmail = async () => {
    setEmailError(null);
    setIsEmailAvailable(null);

    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    try {
      setEmailLoading(true);
      const result = await checkEmailDuplicate(email);
      // console.log(result)
      setIsEmailAvailable(result.result.available);

    } catch (err: any) {
        console.log(err.message)
      setEmailError("중복 확인 요청 중 오류가 발생했습니다.");
    } finally {
      setEmailLoading(false);
    }
  };

  // 이메일 인증 체크
  const handleVerificationEmail = async (verificationType:string) => {
    try{
        const res = await authenticationEmail(email, verificationType);
        console.log(res)
        setExpiredAt(res.result.expiredAt);
    }catch(err){
      console.log(err)
    }
  }

  // 이메일 인증 코드 검증
  const handleVerificationEmailConfirm = async(verificationType:string, code:string)=>{
    setEmailConfirm(null);
    setEmailExpired(null);

    try{
      const res = await authenticationConfirmEmail(email, verificationType, code);
      console.log(res)
      // 인증 성공과 만료여부
      setEmailConfirm(res.result.verified);
      setEmailExpired(res.result.expired);
    }catch(err){
      console.log(err)
    }
  }

  // 닉네임 중복 체크
  const handleCheckNickname = async () => {
    if (!nickname) {
      setNicknameError("닉네임을 입력해주세요.");
      setIsNicknameAvailable(null);
      return;
    }
  
    try {
      setNicknameLoading(true);
      // 형식 재검증 후 부적합하면 종료
      if (!isValidNickname(nickname)) {
        setNicknameError("닉네임은 2~10자의 영문/한글/숫자만 가능합니다.");
        setIsNicknameAvailable(null);
        return;
      }
      // 형식 유효하면 일단 사용 가능으로 유지
      setNicknameError(null);
      setIsNicknameAvailable(true);
  
      const result = await checkNicknameDuplicate(nickname);
        // console.log(result)
      // 올바르지 않은 닉네임
      if (result.code === 400 && result.message) {
        setNicknameError(result.message);
        return;
      }
      setIsNicknameAvailable(result.result.available);
    } catch (err: any) {
      setNicknameError("닉네임 확인 중 오류가 발생했습니다.");
      setIsNicknameAvailable(null);
    } finally {
      setNicknameLoading(false);
    }
  };

  const handleSignup = async () => {
    // 예외처리
    if (!isPasswordValid) {
      alert("비밀번호 형식이 올바르지 않거나 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!isValidEmail(email)) {
        alert(emailError)
        return;
    }
    if(!emailConfirm){
      alert("인증이 완료되지 않았습니다.")
      return;
    }

    try {
      setLoading(true);
      const res = await signup(email, password, nickname, isSocial, providerName);
      

      if(res.code!==200){
        alert(res.message)
      }else{
        console.log(res)
        alert("회원가입에 성공했습니다.")
        router.push('/');
      }
    } catch (err) {
      alert('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return {
      // 소셜 관련
      isSocial, providerName,
      // 이메일
      email, setEmail, isEmailAvailable, emailError, emailLoading, handleCheckEmail,
      // 인증, 인증확인
      handleVerificationEmail, handleVerificationEmailConfirm, emailConfirm, emailExpired, expiredAt, code, setCode,
      // 인증번호 카운트다운
      timeLeft, formatted,
      // 비밀번호
      password, passwordErrorMessage, setPassword, confirmPassword, setConfirmPassword,
      // 닉네임
      nickname, setNickname, isNicknameAvailable, nicknameError, nicknameLoading, handleCheckNickname,
      // 회원가입
      handleSignup,
    };
}
