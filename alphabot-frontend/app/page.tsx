import Hero from "@/components/Hero";
import Tools from "@/components/Tools";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Tools />
      <About />
      <Footer />
    </main>
  );
}