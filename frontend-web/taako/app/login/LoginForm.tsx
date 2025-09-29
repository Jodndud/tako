'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link";

import { useLogin } from "@/hooks/useLogin";

interface LoginFormProps {
    redirectPath: string;
}

export function LoginForm({ redirectPath }: LoginFormProps) {
    const { email, setEmail, password, setPassword, handleLogin } = useLogin(redirectPath);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLogin();
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col items-center gap-10">
            <div className="w-full flex flex-col gap-4">
                <div className="">
                    <Label className="text-sm text-[#a5a5a5] mb-2" htmlFor="email">이메일 주소</Label>
                    <Input type="email" id="email" placeholder="예) tako@tako.co.kr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="">
                    <Label className="text-sm text-[#a5a5a5] mb-2" htmlFor="password">비밀번호</Label>
                    <Input type="password" id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
                <Button type="submit" className="h-12" 
                    disabled={!email || !password}>로그인</Button>
                <div className="flex justify-center gap-2 text-sm text-[#a5a5a5]">
                    <Link href="/signup" className="hover:text-blue-500">회원가입</Link>
                    <div>|</div>
                    <Link href="/signup" className="hover:text-blue-500">비밀번호 찾기</Link>
                </div>
            </div>
        </form>
    );
}
