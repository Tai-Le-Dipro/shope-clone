import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useMutation } from 'react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Button, InputField } from 'src/components/shared';
import { login } from 'src/services/auth.service';
import { toast } from 'react-toastify';
import { isAxiosUnprocessableEntityError } from 'src/utils';
import { ErrorResponseApi } from 'src/types/util.type.ts';
import { useContext } from 'react';
import { AuthContext } from 'src/contexts/auth.context';
interface FormData {
    email: string;
    password: string;
}

const schema = yup
    .object({
        email: yup
            .string()
            .required('Please enter your email')
            .matches(
                /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
                'Incorrect format of email',
            ),
        password: yup
            .string()
            .required('Please enter your password')
            .min(8, 'Password must be at least 8 characters long')
            .matches(
                /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                'At least 8 characters must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number Can contain special characters.',
            ),
    })
    .required();

function LoginPage() {
    const { setIsAuthenticated } = useContext(AuthContext);

    const loginMutation = useMutation({
        mutationFn: (body: FormData) => {
            return login(body);
        },
    });

    const { handleSubmit, control, setError, reset } = useForm<FormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        resolver: yupResolver(schema),
    });

    const handleLogin = (payload: FormData) => {
        loginMutation.mutate(payload, {
            onSuccess: (data) => {
                setIsAuthenticated(true);
                toast.success(data.data.message);
                reset();
            },
            onError: (error) => {
                if (
                    isAxiosUnprocessableEntityError<
                        ErrorResponseApi<Omit<FormData, 'confirmPassword'>>
                    >(error)
                ) {
                    const formError = error.response?.data.data;
                    if (formError) {
                        Object.keys(formError).forEach((key) => {
                            setError(
                                key as keyof Omit<FormData, 'confirmPassword'>,
                                {
                                    type: 'server',
                                    message:
                                        formError[
                                            key as keyof Omit<
                                                FormData,
                                                'confirmPassword'
                                            >
                                        ],
                                },
                            );
                        });
                    }
                } else {
                    console.log(error);
                }
            },
        });
    };

    return (
        <div className="bg-primary">
            <div className="container">
                <div className="grid grid-cols-1 py-12 lg:grid-cols-5 lg:py-32 lg:pr-10">
                    <div className="lg:col-span-2 lg:col-start-4">
                        <form
                            className="space-y-6 rounded bg-white p-10 shadow-sm"
                            noValidate
                            onSubmit={handleSubmit(handleLogin)}
                        >
                            <div className="text-2xl">Đăng nhập</div>
                            <InputField
                                name="email"
                                control={control}
                                type="email"
                                placeholder="Email"
                            />
                            <InputField
                                name="password"
                                control={control}
                                type="password"
                                placeholder="Password"
                                autoComplete="on"
                            />
                            <div className="mt-3">
                                <Button
                                    primary
                                    type="submit"
                                    className="flex w-full items-center justify-center py-4"
                                    isLoading={loginMutation.isLoading}
                                >
                                    Đăng nhập
                                </Button>
                            </div>
                            <div className="mt-8 flex items-center justify-center">
                                <span className="text-gray-400">
                                    Bạn chưa có tài khoản?
                                </span>
                                <Link
                                    className="ml-1 text-red-400"
                                    to="/register"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
