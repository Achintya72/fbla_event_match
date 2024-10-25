import Navbar from "@/components/Navbar";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
export default function Home() {
  return (
    <div className="layout flex flex-col relative nav-top text-center overflow-x-hidden  text-white min-h-[100vh]">
      <Navbar />
      <main className="relative z-10 flex-1 w-full text-center flex flex-col items-center justify-center">

        <h1 className="font-space font-bold">FBLA Event Match</h1>
        <h6 className="font-raleway text-xl font-light">Nikola Tesla STEM&apos;s official website FBLA Event Registration</h6>
        <button className="p-[1px] mt-[20px] rounded-full outline-button">
          <div className="flex font-raleway items-center rounded-full px-[30px] py-[15px] bg-background font-bold gap-[10px]">
            <p>Get Started</p>
            <ArrowRight size={20} />
          </div>
        </button>

      </main>
      <div className="!absolute !z-0 yellow-circle overflow-hidden" />
      <div className="!absolute !z-0 blue-circle" />

    </div>

  );
}
