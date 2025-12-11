/**
 * @file bookmark-bulk-actions.tsx
 * @description 북마크 일괄 삭제 컴포넌트
 *
 * 북마크 목록에서 여러 항목을 선택하여 일괄 삭제할 수 있는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 전체 선택/해제
 * 2. 개별 선택
 * 3. 선택된 항목 개수 표시
 * 4. 일괄 삭제 (확인 다이얼로그 포함)
 *
 * @dependencies
 * - react: useState
 * - next/navigation: useRouter
 * - @/actions/bookmark-actions: toggleBookmark
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/checkbox: Checkbox 컴포넌트
 * - @/components/ui/dialog: Dialog 컴포넌트 (또는 AlertDialog)
 * - @/components/ui/toast: toast 함수
 * - lucide-react: Trash2 아이콘
 */

"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TourItem } from "@/lib/types/tour";

interface BookmarkBulkActionsProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 선택된 항목 ID 목록 */
  selectedIds: Set<string>;
  /** 전체 선택 핸들러 */
  onSelectAll: (checked: boolean) => void;
  /** 일괄 삭제 핸들러 */
  onBulkDelete: () => void;
  /** 삭제 중 여부 */
  isDeleting: boolean;
}

/**
 * 북마크 일괄 삭제 컴포넌트
 */
export function BookmarkBulkActions({
  tours,
  selectedIds,
  onSelectAll,
  onBulkDelete,
  isDeleting,
}: BookmarkBulkActionsProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 일괄 삭제 실행
  const handleBulkDelete = () => {
    setShowConfirmDialog(false);
    onBulkDelete();
  };

  const isAllSelected = selectedIds.size === tours.length && tours.length > 0;

  if (tours.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4">
        {/* 체크박스 및 선택 개수 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              aria-label="전체 선택"
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium cursor-pointer"
            >
              전체 선택
            </label>
          </div>
          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedIds.size}개 선택됨
            </span>
          )}
        </div>

        {/* 일괄 삭제 버튼 */}
        {selectedIds.size > 0 && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirmDialog(true)}
            disabled={isDeleting}
            className="min-h-[44px] min-w-[44px]"
            aria-label="선택한 항목 삭제"
          >
            <Trash2 className="size-4 mr-2" aria-hidden="true" />
            삭제 ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* 확인 다이얼로그 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>북마크 삭제 확인</DialogTitle>
            <DialogDescription>
              선택한 {selectedIds.size}개의 북마크를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


