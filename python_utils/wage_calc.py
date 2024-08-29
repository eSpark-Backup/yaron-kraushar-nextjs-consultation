def calculate_tax(income):
    tax = 0
    if income <= 18200:
        return 0
    elif income <= 45000:
        tax = (income - 18200) * 0.19
    elif income <= 120000:
        tax = 5092 + (income - 45000) * 0.325
    elif income <= 180000:
        tax = 29467 + (income - 120000) * 0.37
    else:
        tax = 51667 + (income - 180000) * 0.45
    return tax

def calculate_medicare_levy(income):
    return income * 0.02

def calculate_gross_income(desired_net_weekly):
    desired_net_annual = desired_net_weekly * 52
    low = desired_net_annual  # Start with the desired net as the lower bound
    high = desired_net_annual * 2  # An arbitrary upper bound

    while high - low > 1:  # Continue until we're within $1 of the correct amount
        mid = (low + high) / 2
        tax = calculate_tax(mid)
        medicare = calculate_medicare_levy(mid)
        net = mid - tax - medicare

        if net > desired_net_annual:
            high = mid
        else:
            low = mid

    return round(high)  # Round to the nearest dollar

def main():
    desired_net_weekly = float(input("Enter desired weekly net income: $"))
    
    gross_annual = calculate_gross_income(desired_net_weekly)
    tax = calculate_tax(gross_annual)
    medicare = calculate_medicare_levy(gross_annual)
    net_annual = gross_annual - tax - medicare

    print(f"\nResults:")
    print(f"Required gross annual income: ${gross_annual:,.2f}")
    print(f"Required gross weekly income: ${gross_annual/52:,.2f}")
    print(f"Annual tax: ${tax:,.2f}")
    print(f"Annual Medicare levy: ${medicare:,.2f}")
    print(f"Net annual income: ${net_annual:,.2f}")
    print(f"Net weekly income: ${net_annual/52:,.2f}")

if __name__ == "__main__":
    main()