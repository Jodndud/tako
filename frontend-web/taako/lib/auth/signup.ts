import api from "@/lib/api";

export const checkEmailDuplicate = async (email: string) => {
  const res = await api.get("/v1/auth/availability/email", {
    params: { email : email },
  });
  return res.data;
};

export const authenticationEmail = async (email:string, verificationType:string) => {
    const res = await api.post("/v1/auth/email/verification", {
        email,
        verificationType,
    })
    return res.data;
}

export const authenticationConfirmEmail = async (email:string, verificationType:string, code:string) => {
  const res = await api.post("/v1/auth/email/verification/confirm", {
      email,
      verificationType,
      code,
  })
  return res.data;
}

export const checkNicknameDuplicate = async (nickname:string) => {
    const res = await api.get("/v1/auth/availability/nickname", {
        params: { nickname : nickname }
    });
    return res.data;
}

export const signup = async(email:string, password:string, nickname:string, isSocial:boolean, providerName:string) => {
    const res = await api.post("/v1/auth/sign-up", {
        email,
        password,
        nickname,
        isSocial,
        providerName,
    })
    return res.data;
}