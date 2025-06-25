export interface Skin {
  id?: string; 
  name: string;
  description: string;
  price: number | null;
  imagem: string; 
  rarity?: string; 
  disponivel: boolean;
  estoque: number;
  a_venda: boolean;
  criado_em: string;
  plataforma: string;
  condicao: string;
  stattrak: boolean;
  float?: string;
  imageUrl?: string; 
}
