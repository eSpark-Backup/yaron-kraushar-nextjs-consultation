import React, { useState } from 'react';
import axios from 'axios'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup'
import { FiCopy } from 'react-icons/fi'; // Importing the copy icon

// Form validation schema
const schema = Yup.object().shape({
    numTokens: Yup.number().required().positive().integer().min(1, 'Must be at least 1').max(100, 'Must be at most 100'),
    username: Yup.string().required(),
    password: Yup.string().required(),
});

export default function GenerateTokens() {
    const { register, handleSubmit, setError, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
    const [tokens, setTokens] = useState([]);
    const [copied, setCopied] = useState(false); // To manage copied status

    const onSubmit = async (data) => {
        const { numTokens, username, password } = data;

        try {
            const response = await axios.post('/api/generate_tokens', { numTokens, username, password });
            if (response.data.tokens) {
                setTokens(response.data.tokens);
            } else {
                console.error("Invalid response", response.data);
                setError("numTokens", {
                    type: "manual",
                    message: "Invalid response from the server",
                });
            }
        } catch (error) {
            // Check if it's a server-side error and set it to form error state
            if (error.response && error.response.data.error) {
                setError(error.response.data.field, {
                    type: "manual",
                    message: error.response.data.error,
                });
            }
            //console.error(error);
        }
    };

    // Function to copy a token to clipboard
    const copyToClipboard = async (token) => {
        await navigator.clipboard.writeText(token);
        setCopied(true); // After copying, set copied status to true
        setTimeout(() => setCopied(false), 2000); // Reset copied status after 2 seconds
    };

    return (
        <div>
            <div className="flex flex-row items-center p-10">
                <div>
                    <div className="text-4xl font-extralight text-white pb-14">Generate Jimple Access Tokens</div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col md:flex-row items-start md:items-center mb-8">
                            <label htmlFor="numTokens">Number Of Tokens</label>
                            <input className="ml-5 p-2" type="number" {...register("numTokens")} />
                            {errors.numTokens && <p className="ml-5">Please enter a valid number between 1 and 100.</p>}
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center mb-8">
                            <label htmlFor="username">Username</label>
                            <input className="ml-5 p-2" type="text" {...register("username")} />
                            {errors.username && <p className="ml-5">Username wrong</p>}
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center mb-8">
                            <label htmlFor="password">Password</label>
                            <input className="ml-5 p-2" type="password" {...register("password")} />
                            {errors.password && <p className="ml-5">Password wrong</p>}
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center mb-8">
                            <div className="bg-slate-500 p-2 rounded-md">
                                <button type="submit">Submit Request</button>
                            </div>
                        </div>
                    </form>

                    {tokens.length > 0 && (
                        <div>
                            <h3 className="mb-2 text-2xl">Generated Tokens:</h3>
                            <ul>
                                {tokens.map((token, index) => (
                                    <li key={index} className="mt-2 flex justify-between items-center">
                                        <span>{token}</span>
                                        <div className="flex items-center">
                                            {!copied && <FiCopy onClick={() => copyToClipboard(token)} className="cursor-pointer text-xl transform transition-transform duration-150 ease-in-out hover:scale-110" />}
                                            {copied && <span className="text-green-500 ml-4">  Token copied!</span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

