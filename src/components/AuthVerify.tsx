"use client"

import { useRouter } from 'next/navigation';
import { useEffect,useSyncExternalStore } from 'react';

type Status = boolean | null;

const subscribe = () => () => {};

const getStatus = (): Status => {
    try {
        return localStorage.getItem("logged") !== null;
    } catch {
        return false;
    }
}
const getServerStatus = (): Status => null;

const AuthVerify = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const status = useSyncExternalStore(subscribe, getStatus, getServerStatus);

    useEffect(() => {
        if (status === false) router.replace("/login");
    }, [status, router]);

    if (status !== true) return null;
    
  return (
    <>
     {children} 
    </>
  )
}

export default AuthVerify