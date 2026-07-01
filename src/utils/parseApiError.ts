const httpMessages: Record<number, string> = {
  400: 'Requisição inválida. Verifique os dados informados.',
  401: 'Chave da API inválida ou não autorizada.',
  404: 'Cidade não encontrada. Verifique o nome.',
  429: 'Limite de requisições excedido. Aguarde e tente novamente.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  502: 'Servidor temporariamente indisponível. Tente novamente.',
  503: 'Serviço indisponível no momento. Tente novamente.',
};

export class ApiError extends Error {
  constructor(
    public status: number,
    apiMessage?: string,
  ) {
    super(httpMessages[status] || apiMessage || `Erro na requisição (código ${status}).`);
    this.name = 'ApiError';
  }
}

export function parseApiError(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Sem conexão com a internet. Verifique sua rede.';
  }
  if (err instanceof Error) return err.message;
  return 'Erro desconhecido. Tente novamente.';
}
