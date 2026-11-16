import SignUpForm from '@/domains/auth/components/SignUpForm';

export const metadata = { title: '회원가입' };

export default function SignUpPage() {
    return (
        <>
            <h1 className="mb-6 text-2xl font-bold">회원가입</h1>
            <SignUpForm />
        </>
    );
}