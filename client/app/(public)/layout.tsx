


interface props {
    children: React.ReactNode;
}

export default function ProductsLayout({children}: props) {
  return (
    <div>
      {children}
    </div>
  );
}