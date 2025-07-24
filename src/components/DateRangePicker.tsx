import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export function DateRangePicker() {
  const { state, dispatch } = useApp();
  const { dateRange } = state;
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetSelect = (preset: string) => {
    const end = new Date();
    let start = new Date();

    switch (preset) {
      case 'week':
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6months':
        start = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    dispatch({
      type: 'SET_DATE_RANGE',
      payload: { start, end },
    });
    setIsOpen(false);
  };

  const handleDateSelect = (dates: { from: Date | undefined; to: Date | undefined }) => {
    if (dates.from && dates.to) {
      dispatch({
        type: 'SET_DATE_RANGE',
        payload: { start: dates.from, end: dates.to },
      });
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-auto justify-start text-left font-normal',
            !dateRange && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange ? (
            `${format(dateRange.start, 'LLL dd, y')} - ${format(dateRange.end, 'LLL dd, y')}`
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="border-r p-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Quick Select</h4>
              <div className="grid gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePresetSelect('week')}
                  className="justify-start"
                >
                  Last Week
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePresetSelect('month')}
                  className="justify-start"
                >
                  Last Month
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePresetSelect('3months')}
                  className="justify-start"
                >
                  Last 3 Months
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePresetSelect('6months')}
                  className="justify-start"
                >
                  Last 6 Months
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePresetSelect('year')}
                  className="justify-start"
                >
                  Last Year
                </Button>
              </div>
            </div>
          </div>
          <Calendar
            mode="range"
            selected={{
              from: dateRange.start,
              to: dateRange.end,
            }}
            onSelect={(range) =>
              handleDateSelect({
                from: range?.from,
                to: range?.to,
              })
            }
            numberOfMonths={2}
            className="p-3"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}