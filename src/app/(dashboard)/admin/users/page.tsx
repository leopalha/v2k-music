'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Ban, CheckCircle, Search, Shield } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  profileImageUrl: string | null;
  role: string;
  kycStatus: string;
  kycVerifiedAt: Date | null;
  createdAt: Date;
  _count: {
    transactions: number;
    portfolio: number;
    comments: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
      });
      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to ban user');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Erro ao banir usuário');
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to unban user');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Erro ao desbanir usuário');
    }
  };

  const handleVerify = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to verify user');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Erro ao verificar usuário');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">{total} usuários cadastrados</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(value: string) => {
                setSearch(value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name || 'Sem nome'}</span>
                      {user.role === 'ADMIN' && (
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {user.role === 'SUPER_ADMIN' && (
                        <Badge variant="default">
                          <Shield className="h-3 w-3 mr-1" />
                          Super Admin
                        </Badge>
                      )}
                      {user.kycStatus === 'REJECTED' && <Badge variant="error">Rejeitado</Badge>}
                      {user.kycVerifiedAt && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {user._count.transactions} transações • {user._count.portfolio}{' '}
                      músicas • {user._count.comments} comentários
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!user.kycVerifiedAt && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerify(user.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verificar
                      </Button>
                    )}

                    {user.role === 'USER' && (
                      <>
                        {user.kycStatus === 'REJECTED' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnban(user.id)}
                          >
                            Restaurar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleBan(user.id)}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {Math.ceil(total / 20)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
