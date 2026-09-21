'use client';

import { useState, useId } from 'react';
import { useLanguage } from '@/lib/i18n/context';

interface MortgageCalculatorProps {
  price: number;
}

export const MortgageCalculator = ({ price }: MortgageCalculatorProps) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [years, setYears] = useState(30);

  const downPaymentId = useId();
  const interestRateId = useId();
  const loanTermId = useId();

  // Formula for fixed mortgage payment: P * [ r(1 + r)^n ] / [ (1 + r)^n – 1]
  const downPayment = (price * downPaymentPercent) / 100;
  const principal = price - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = years * 12;

  const monthlyPayment =
    monthlyRate > 0
      ? (principal *
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : principal / numberOfPayments;

  const formattedMonthly = Math.round(monthlyPayment).toLocaleString('en-US');

  return (
    <div className="bg-[#006655]/5 p-6 rounded-xl border border-[#006655]/10 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4 w-full sm:w-auto">
          <div className="p-3 bg-white rounded-full text-[#006655] shadow-sm flex-shrink-0">
            <span className="material-icons">calculate</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#19322F]">
              {t('propertyDetail.estimatedPayment')}
            </h3>
            <p className="text-sm text-[#19322F]/70">
              {t('propertyDetail.startingFrom')}{' '}
              <strong className="text-[#006655] font-bold">
                ${formattedMonthly}/mo
              </strong>{' '}
              {t('propertyDetail.withDown', { percent: downPaymentPercent })}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="whitespace-nowrap px-4 py-2 bg-white border border-[#19322F]/10 rounded-lg text-sm font-semibold hover:border-[#006655] hover:text-[#006655] transition-colors text-[#19322F] cursor-pointer w-full sm:w-auto text-center"
        >
          {isExpanded ? t('propertyDetail.hideCalculator') : t('propertyDetail.calculateMortgage')}
        </button>
      </div>

      {isExpanded && (
        <div className="pt-4 border-t border-[#006655]/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <label htmlFor={downPaymentId} className="block text-xs font-medium text-[#19322F]/70 mb-1">
              {t('propertyDetail.downPayment')} ({downPaymentPercent}%)
            </label>
            <input
              id={downPaymentId}
              type="range"
              min={5}
              max={50}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-[#006655]"
            />
            <span className="text-xs text-[#5C706D]">
              ${Math.round(downPayment).toLocaleString()}
            </span>
          </div>

          <div>
            <label htmlFor={interestRateId} className="block text-xs font-medium text-[#19322F]/70 mb-1">
              {t('propertyDetail.interestRate')} ({interestRate}%)
            </label>
            <input
              id={interestRateId}
              type="range"
              min={3}
              max={10}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-[#006655]"
            />
            <span className="text-xs text-[#5C706D]">{interestRate}% APR</span>
          </div>

          <div>
            <label htmlFor={loanTermId} className="block text-xs font-medium text-[#19322F]/70 mb-1">
              {t('propertyDetail.loanTerm')} ({years} {t('propertyDetail.years')})
            </label>
            <select
              id={loanTermId}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs text-[#19322F]"
            >
              <option value={15}>15 {t('propertyDetail.years')}</option>
              <option value={20}>20 {t('propertyDetail.years')}</option>
              <option value={30}>30 {t('propertyDetail.years')}</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

