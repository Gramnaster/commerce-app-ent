import { Form, Link, redirect, type ActionFunctionArgs } from "react-router-dom";
import { customFetch } from "../../utils";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { FormInput, SubmitBtn } from "../../components";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  
  // Add userDetailAttributes
  // user["key"]
  // If reach dob,
  // Add to userDetailAttributes
  // Append userDetailAttributes submitData

  // Convert to FormData to avoid preflight (same fix as login)
  const submitData = new FormData();
  console.log(`PromotionCreate submitData`, submitData);
  
  Object.entries(data).forEach(([key, value]) => {
    submitData.append(`promotion[${key}]`, value as string);
    console.log(`submitData append ${key}:`, value);
  });


  try {
    await customFetch.post('/promotions', submitData);
    toast.success('Promotion created successfully');
    return redirect('/promotions');

  } catch (error) {
    const err = error as AxiosError<{ error: { message: string } }>;
    const errorMessage =
      err.response?.data?.error?.message || 'Double check thy credentials';
    toast.error(errorMessage);
    return null;
  }
};

const PromotionCreate = () => {
  return (
    <section className="h-screen grid place-items-center">
      <Form
        method="POST"
        className="card w-150 p-8 bg-base shadow-lg flex flex-col gap-y-4"
      >
        <h4> Create promotion </h4>
        <div className="flex flex-row">
          <div className="flex flex-col gap-x-10 mx-10">
            <FormInput
              type="number"
              label="Discount Amount"
              name="discount_amount"
            />
            <div className="my-4 gap-y-4">
              <Link to="/Promotions">
                <button className="btn bg-neutral-800 btn-block">Cancel</button>
              </Link>
              <SubmitBtn text="Create Promotion" />
            </div>
          </div>
        </div>
      </Form>
    </section>
  )
}

export default PromotionCreate