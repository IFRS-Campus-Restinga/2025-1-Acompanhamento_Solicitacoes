import React from "react";
import Footer from "../components/footer";
import Header from "../components/header";
import Navbar from "../components/navbar";

const Home = () => {
  return (
    <div>
      <Header />
      <Navbar />
      <main>
        <h1>Bem-vindo ao Sistema de Solicitações</h1>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
