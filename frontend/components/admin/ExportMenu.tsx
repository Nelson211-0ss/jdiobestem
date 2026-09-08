'use client';

import { Download, FileSpreadsheet, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Download the table as a file.
 *
 * The link carries the filters that are in force, so the file matches the
 * screen rather than quietly exporting everything — a report that says more
 * than the page it came from is a report nobody can check.
 *
 * Plain links rather than fetch-and-save: the response is an attachment, so the
 * browser does the saving and a large export never sits in a JS buffer.
 */
export default function ExportMenu({ href, label }: { href: string; label: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">
            Exactly what the table is showing, filters included.
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={`${href}&fmt=pdf`} download>
            <FileText />
            <span>
              PDF report
              <span className="block text-xs text-muted-foreground">Branded, ready to send</span>
            </span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`${href}&fmt=csv`} download>
            <FileSpreadsheet />
            <span>
              CSV data
              <span className="block text-xs text-muted-foreground">Opens in a spreadsheet</span>
            </span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
