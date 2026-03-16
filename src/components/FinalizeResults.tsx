// components/FinalizeResults.tsx
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { FinalizeResponse, CategorySummary, FinalizedBet } from '@/types/lottery';
import { getBetCategory, getCategoryDisplayLabel } from '@/types/lottery';

interface ResultRowProps {
  bet: FinalizedBet;
}

function ResultRow({ bet }: ResultRowProps) {
  // Your existing ResultRow component
  return (
    <div className={`text-sm ${bet.win ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
      {bet.type === 'xien' ? (
        <span>{bet.numbers?.join('-')} × {bet.amount}</span>
      ) : (
        <span>{bet.number} × {bet.amount}</span>
      )}
      {bet.win && <span className="ml-2">✓</span>}
    </div>
  );
}

interface FinalizeResultsProps {
  finalizeData: FinalizeResponse['data'];
}

export default function FinalizeResults({ finalizeData }: FinalizeResultsProps) {
  return (
     <div className='flex-1 min-h-0 overflow-auto -mx-6 px-6'>
    <div className='space-y-5 pb-4'>
 
      {/* KQXS tóm tắt */}
      <div className='rounded-lg bg-muted/40 p-3 text-sm'>
        <div className='flex flex-wrap gap-x-6 gap-y-1'>
          <span>
            <span className='text-muted-foreground'>Đề (ĐB):</span>{' '}
            <span className='font-bold text-lg text-red-600'>
              {finalizeData.kqxs.deLast2}
            </span>
          </span>
          <span>
            <span className='text-muted-foreground'>Lô (2 số cuối):</span>{' '}
            <span className='font-mono text-xs'>
              {finalizeData.kqxs.allLast2.join(', ')}
            </span>
          </span>
        </div>
      </div>
 
      {/* Danh sách chi tiết các bets */}
      {Object.entries(finalizeData.summary).map(([cat, group]) => {
        const bets = finalizeData.finalized.filter(
          (b) => {
            if (b.isDan) {
              const danKey = `${b.danType}${b.danValue !== undefined ? ' ' + b.danValue : ''}`;
              return `${b.type}_${danKey}` === cat;
            }
            return b.type === cat;
          }
        );
 
        const displayLabel = group.isDan 
          ? `${group.label} (${group.danType}${group.danValue ? ' ' + group.danValue : ''})`
          : group.label;
 
        return (
          <div key={cat}>
            <div className='flex items-center gap-2 mb-2'>
              <Badge
                variant={group.totalWin > 0 ? 'default' : 'secondary'}
                className={group.totalWin > 0 ? 'bg-red-600' : ''}
              >
                {displayLabel}
              </Badge>
              <span className='text-xs text-muted-foreground'>
                {group.totalWin > 0 ? (
                  <span className='text-red-600 font-medium'>
                    {group.totalWin}
                  </span>
                ) : (
                  <span>0</span>
                )}
                /{group.totalBet}
              </span>
            </div>
            <div className='ml-2 space-y-0.5'>
              {bets.map((bet, j) => (
                <ResultRow key={j} bet={bet} />
              ))}
            </div>
          </div>
        );
      })}
 
      {/* TỔNG KẾT - CHỈ 5 Ô CƠ BẢN */}
      <Separator />
      <div className='rounded-lg border-2 border-dashed p-4'>
        <h4 className='font-semibold mb-3 text-sm'>Tổng kết</h4>
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
          {/* Aggregate by base type (de, lo, xien2, xien3, xien4) */}
          {(() => {
            // Group by base type
            const baseTypes = {
              de: { label: 'Đề', totalBet: 0, totalWin: 0 },
              lo: { label: 'Lô', totalBet: 0, totalWin: 0 },
              xien2: { label: 'Xiên 2', totalBet: 0, totalWin: 0 },
              xien3: { label: 'Xiên 3', totalBet: 0, totalWin: 0 },
              xien4: { label: 'Xiên 4', totalBet: 0, totalWin: 0 },
            };
 
            // Aggregate all categories into base types
            Object.entries(finalizeData.summary).forEach(([cat, group]) => {
              // Determine base type
              let baseType = null;
              if (cat.startsWith('de_') || cat === 'de') {
                baseType = 'de';
              } else if (cat.startsWith('lo_') || cat === 'lo') {
                baseType = 'lo';
              } else if (cat === 'xien2') {
                baseType = 'xien2';
              } else if (cat === 'xien3') {
                baseType = 'xien3';
              } else if (cat === 'xien4') {
                baseType = 'xien4';
              }
 
              if (baseType && baseTypes[baseType]) {
                baseTypes[baseType].totalBet += group.totalBet;
                baseTypes[baseType].totalWin += group.totalWin;
              }
            });
 
            // Render only types that have bets
            return Object.entries(baseTypes)
              .filter(([_, type]) => type.totalBet > 0)
              .map(([key, type]) => {
                const hasWin = type.totalWin > 0;
                return (
                  <div
                    key={key}
                    className={`rounded-md px-3 py-2 text-center text-sm ${
                      hasWin
                        ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
                        : 'bg-muted/40 border'
                    }`}
                  >
                    <div className='text-xs text-muted-foreground mb-0.5'>
                      {type.label}
                    </div>
                    <div className={`text-lg font-bold ${hasWin ? 'text-red-600' : ''}`}>
                      {type.totalWin}/{type.totalBet}
                    </div>
                  </div>
                );
              });
          })()}
        </div>
      </div>
    </div>
  </div>
  );
}