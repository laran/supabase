import { useParams } from 'common'
import ShimmeringLoader from 'components/ui/ShimmeringLoader'
import { useProjectSubscriptionQuery } from 'data/subscriptions/project-subscription-query'
import { PRICING_TIER_PRODUCT_IDS } from 'lib/constants'
import { Button, IconAlertCircle } from 'ui'

export interface CostControlProps {}

const CostControl = ({}: CostControlProps) => {
  const { ref: projectRef } = useParams()
  const { data: subscription, isLoading } = useProjectSubscriptionQuery({ projectRef })
  const currentTier = subscription?.tier?.supabase_prod_id ?? ''
  const isSpendCapOn = [PRICING_TIER_PRODUCT_IDS.PAYG, PRICING_TIER_PRODUCT_IDS.TEAM].includes(
    currentTier
  )

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-5">
        <p className="text-base">Cost control</p>
        <p className="text-sm text-scale-1000">Some description text here</p>
      </div>
      {isLoading ? (
        <div className="col-span-7 space-y-2">
          <ShimmeringLoader />
          <ShimmeringLoader className="w-3/4" />
          <ShimmeringLoader className="w-1/2" />
        </div>
      ) : (
        <div className="col-span-7 space-y-6">
          <p className="text-sm text-scale-1000">
            You can control whether your project is charged for additional usage beyond the included
            usage of your subscription plan. If you need to go beyond the included usage, simply
            switch off your spend cap to pay for additional usage.
          </p>
          {currentTier === PRICING_TIER_PRODUCT_IDS.TEAM && (
            <div className="w-full bg-scale-100 px-6 py-4 rounded-md flex space-x-4">
              <div>
                <IconAlertCircle strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm">
                  You will be charged for any additional usage on the Team subscription plan
                </p>
                <p className="text-sm text-scale-1000">
                  Team plan requires you to have Spend Cap off at all times. Your project will never
                  become unresponsive or be paused. Only when your included usage is exceeded will
                  you be charged for any additional usage.
                </p>
              </div>
            </div>
          )}
          <div className="flex space-x-6">
            <div>
              <div className="rounded-md bg-scale-400 w-[160px] h-[96px]">
                {/* Spend cap picture here */}
              </div>
            </div>
            <div>
              <p className="mb-1">Spend cap is {isSpendCapOn ? 'on' : 'off'}</p>
              <p className="text-sm text-scale-1000">
                {isSpendCapOn
                  ? 'You will be charged for any extra usage above your included usage quota'
                  : 'You will never be charged any extra for usage. However, your project will experience downtime if you exceed the included usage quota'}
              </p>
              <Button type="default" className="mt-4">
                Change spend cap
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CostControl