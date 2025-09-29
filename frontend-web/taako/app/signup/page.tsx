'use client';

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import Image from 'next/image';
import { useSignupForm } from "@/hooks/useSignupForm";
import { useLoginRedirect } from "@/hooks/useAuthRedirect";

export default function Signup(){
  // 로그인한 사용자의 접근 차단
  useLoginRedirect(true, true);
  
  const {
    isSocial: _isSocial, providerName: _providerName, handleSignup,
    email, setEmail, isEmailAvailable, emailError, emailLoading: _emailLoading,
    handleVerificationEmail, expiredAt, formatted, timeLeft,
    handleCheckEmail, handleVerificationEmailConfirm, emailConfirm, emailExpired, code, setCode,
    password, passwordErrorMessage, setPassword, confirmPassword, setConfirmPassword,
    nickname, setNickname, isNicknameAvailable, nicknameError, nicknameLoading: _nicknameLoading, handleCheckNickname,
  } = useSignupForm();

    return (
        <div className="small-container pb-20">
            <h2 className="mb-10">일반 회원가입</h2>
            <div>
                <form
                className="flex flex-col gap-10"
                onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <p className="mb-4">이메일</p>
                        <div className='flex flex-col gap-3'>
                            <div className="flex gap-4">
                                <Input 
                                className="w-full px-5 py-3 bg-[#191924] rounded-lg border-1 border-[#353535] text-sm"
                                type="email"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일을 입력해주세요"/>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCheckEmail}
                                    className="min-w-[140px] py-6 bg-[#3E4C63] rounded-lg text-md cursor-pointer hover:bg-[#324c63]"
                                >중복체크</Button>
                            </div>
                            {emailError && (
                              <div className="text-[#FF3737] flex gap-2 items-center">
                                <Image src="/icon/error.svg" width={18} height={18} alt="error" />
                                {emailError}
                              </div>
                            )}
                            {isEmailAvailable===true && (
                              <div className="text-[#40C057] flex gap-2 items-center">
                                <Image src="/icon/correct.svg" width={18} height={18} alt="success" />
                                사용 가능한 이메일입니다.
                              </div>
                            )}
                            {isEmailAvailable===false && (
                              <div className="text-[#FF3737] flex gap-2 items-center">
                                <Image src="/icon/error.svg" width={18} height={18} alt="error" />
                                이미 사용중인 이메일입니다.
                              </div>
                            )}
                            <div className="flex gap-4">
                                <div className='w-full relative'>
                                    <Input
                                    className="w-full px-5 py-3 bg-[#191924] rounded-lg border-1 border-[#353535] text-sm"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    disabled={!isEmailAvailable || emailExpired === true || (emailConfirm===true && !emailExpired)}
                                    placeholder="인증번호 입력해주세요"/>
                                    <p className='absolute top-1/2 right-5 -translate-y-1/2'>
                                      {timeLeft > 0 && !emailExpired && !(emailConfirm && !emailExpired) ? formatted : ''}
                                    </p>
                                </div>
                                {expiredAt === null && emailExpired === null ? (
                                  <Button
                                    type="button"
                                    disabled={!isEmailAvailable}
                                    className="min-w-[140px] py-6 bg-[#3E4C63] rounded-lg text-md text-white cursor-pointer hover:bg-[#324c63]"
                                    onClick={() => handleVerificationEmail("SIGN_UP")}
                                  >
                                    인증번호전송
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    disabled={emailExpired === true || (emailConfirm===true && !emailExpired)}
                                    className="min-w-[140px] py-6 bg-[#3E4C63] rounded-lg text-md text-white cursor-pointer hover:bg-[#324c63]"
                                    onClick={() => handleVerificationEmailConfirm("SIGN_UP", code)}
                                  >
                                    인증하기
                                  </Button>
                                )}
                            </div>
                            {emailConfirm===true && emailExpired===false && (
                              <div className="text-[#40C057] flex gap-2 items-center">
                                <Image src="/icon/correct.svg" width={18} height={18} alt="success" />
                                인증에 성공했습니다.
                              </div>
                            )}
                            {!emailConfirm && emailExpired===false && (
                              <div className="text-[#FF3737] flex gap-2 items-center">
                                <Image src="/icon/error.svg" width={18} height={18} alt="error" />
                                인증에 실패했습니다.
                              </div>
                            )}
                            {emailExpired && !emailConfirm && (
                              <div className="text-[#FF3737] flex gap-2 items-center">
                                <Image src="/icon/error.svg" width={18} height={18} alt="error" />
                                인증시간이 만료되었습니다.
                              </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="mb-4">비밀번호</p>
                        <div className="flex flex-col gap-3">
                            <Input
                            className="w-full px-5 py-3 bg-[#191924] rounded-lg border-1 border-[#353535] text-sm"
                            type="password"
                            required
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}/>
                            <Input
                            className="w-full px-5 py-3 bg-[#191924] rounded-lg border-1 border-[#353535] text-sm"
                            type="password"
                            required
                            placeholder="비밀번호확인"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}/>
                            {passwordErrorMessage && (
                                <div className="text-[#FF3737] text-md mt-1 flex gap-2 items-center">
                                  <Image src="/icon/error.svg" width={18} height={18} alt="error" />
                                  {passwordErrorMessage}
                                </div>
                              )}
                              {!passwordErrorMessage && password && confirmPassword && (
                                <div className="text-[#40C057] text-md mt-1 flex gap-2 items-center">
                                  <Image src="/icon/correct.svg" width={18} height={18} alt="correct" />
                                  비밀번호가 유효합니다.
                                </div>
                              )}
                        </div>
                    </div>
                    <div>
                        <p className="mb-4">닉네임</p>
                        <div className="flex flex-col gap-3">
                            <div className='flex gap-4'>
                                <Input
                                className="w-full px-5 py-3 bg-[#191924] rounded-lg border-1 border-[#353535] text-sm"
                                type="text"
                                value={nickname}
                                required
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="닉네임을 입력해주세요"/>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="min-w-[140px] py-6 bg-[#3E4C63] rounded-lg text-md text-white cursor-pointer hover:bg-[#324c63]"
                                    onClick={handleCheckNickname}
                                >중복체크</Button>
                            </div>
                            {/* 에러 메시지 */}
                            {nicknameError && (
                            <div className="text-[#FF3737] text-md mt-1 flex gap-2 items-center">
                                <Image src="/icon/error.svg" width={18} height={18} alt="error" />
                                {nicknameError}
                            </div>
                            )}

                            {!nicknameError && isNicknameAvailable === true && (
                            <div className="text-[#40C057] text-md mt-1 flex gap-2 items-center">
                                <Image src="/icon/correct.svg" width={18} height={18} alt="correct" />
                                사용 가능한 닉네임입니다.
                            </div>
                            )}
                            {!nicknameError && isNicknameAvailable === false && (
                            <div className="text-[#FF3737] text-md mt-1 flex gap-2 items-center">
                                <Image src="/icon/error.svg" width={18} height={18} alt="error" />
                                이미 존재하는 닉네임입니다.
                            </div>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className='w-[150px] px-8 py-3 cursor-pointer rounded-lg bg-[#364153] text-[#7DB7CD] border-1 border-[#7DB7CD] hover:bg-[#3E4C63]'
                        onClick={handleSignup}
                    >
                        회원가입
                    </button>
                </form>
            </div>
        </div>
    )
}