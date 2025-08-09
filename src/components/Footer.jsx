function Footer() {
    return (
        <footer
            style={{
                background: "#023e8a",
                padding: "10px",
                color: "#fff",
                width: "100%",
                textAlign: "center",
            }}
        >
            <p>© {new Date().getFullYear()} PetWay - Todos los derechos reservados</p>
        </footer>
    );
}

export default Footer;
