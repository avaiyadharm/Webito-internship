"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { Order } from "@/lib/api";

type SortConfig = { key: keyof Order; direction: "asc" | "desc" } | null;

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "id", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleSort = (key: keyof Order) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedOrders = useMemo(() => {
    const sortableItems = [...orders];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return sortConfig.direction === "asc" ? 1 : -1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === "asc" ? -1 : 1;

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [orders, sortConfig]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderSortIcon = (columnKey: keyof Order) => {
    if (sortConfig?.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <svg className="w-3 h-3 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
    ) : (
      <svg className="w-3 h-3 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    );
  };

  if (orders.length === 0) {
    return (
      <Card className="text-center p-12 border-black/5 mac-shadow">
        <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-muted-foreground text-sm">No orders found</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden animate-fade-in border-black/5 mac-shadow">
      <Table>
        <TableHeader>
          <TableRow className="border-border/40 hover:bg-transparent bg-[#F5F5F7]/60">
            <TableHead className="py-4 px-5 text-[#86868b] font-semibold text-[11px] uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort("order_id")}>
              Order ID {renderSortIcon("order_id")}
            </TableHead>
            <TableHead className="py-4 px-5 text-[#86868b] font-semibold text-[11px] uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort("product_name")}>
              Product {renderSortIcon("product_name")}
            </TableHead>
            <TableHead className="py-4 px-5 text-[#86868b] font-semibold text-[11px] uppercase tracking-wider cursor-pointer select-none text-right" onClick={() => handleSort("quantity")}>
              Qty {renderSortIcon("quantity")}
            </TableHead>
            <TableHead className="py-4 px-5 text-[#86868b] font-semibold text-[11px] uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort("customer_name")}>
              Customer {renderSortIcon("customer_name")}
            </TableHead>
            <TableHead className="py-4 px-5 text-[#86868b] font-semibold text-[11px] uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort("status")}>
              Status {renderSortIcon("status")}
            </TableHead>
            <TableHead className="py-4 px-5 text-[#86868b] font-semibold text-[11px] uppercase tracking-wider">
              Supplier
            </TableHead>
            <TableHead className="py-4 px-5 text-[#86868b] font-semibold text-[11px] uppercase tracking-wider text-right">
              Tracking
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedOrders.map((order, i) => (
            <TableRow
              key={order.id}
              className="border-border/30 hover:bg-black/[0.02] transition-colors cursor-pointer group"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <TableCell className="px-5 py-4">
                <Link
                  href={`/orders/${order.id}`}
                  className="font-semibold text-[13px] tracking-tight hover:underline transition-colors"
                >
                  #{order.order_id}
                </Link>
              </TableCell>
              <TableCell className="px-5 py-4 font-medium text-[13px] text-foreground/90 truncate max-w-[200px]">
                {order.product_name}
              </TableCell>
              <TableCell className="px-5 py-4 text-right text-[13px] font-medium text-muted-foreground">
                {order.quantity}
              </TableCell>
              <TableCell className="px-5 py-4 text-[13px] text-muted-foreground">
                {order.customer_name}
              </TableCell>
              <TableCell className="px-5 py-4">
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell className="px-5 py-4 text-[13px] text-muted-foreground">
                {order.supplier_name || "—"}
              </TableCell>
              <TableCell className="px-5 py-4 text-right text-[13px] text-muted-foreground font-mono">
                {order.tracking_number || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-border/40 bg-white">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, sortedOrders.length)}</span> of{" "}
            <span className="font-medium text-foreground">{sortedOrders.length}</span> orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
