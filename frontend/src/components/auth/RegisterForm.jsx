"use client";

import { useForm } from "react-hook-form";

function RegisterForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <lable>
          Email:
            <input {...register("email")} />
        </lable>
        <label>
           Password:
             <input {...register("password")} />
        </label>

      <button type="submit">Register</button>
    </form>
  );
}

export default RegisterForm;