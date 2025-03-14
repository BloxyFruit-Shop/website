<script>
  const sections = [
    {
      title: "Privacy Policy",
      content: `This Privacy Policy describes how BloxyFruit (the "Site", "we", "us", or "our") collects, uses, and discloses your personal information when you visit, use our services, or make a purchase from bloxcheckout.myshopify.com (the "Site") or otherwise communicate with us (collectively, the "Services"). For purposes of this Privacy Policy, "you" and "your" means you as the user of the Services, whether you are a customer, website visitor, or another individual whose information we have collected pursuant to this Privacy Policy.

Please read this Privacy Policy carefully. By using and accessing any of the Services, you agree to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree to this Privacy Policy, please do not use or access any of the Services.`
    },
    {
      title: "Changes to This Privacy Policy",
      content: `We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on the Site, update the "Last updated" date, and take any other steps required by applicable law.`
    },
    {
      title: "How We Collect and Use Your Personal Information",
      content: `To provide the Services, we collect and have collected over the past 12 months personal information about you from a variety of sources, as set out below. The information that we collect and use varies depending on how you interact with us.

In addition to the specific uses set out below, we may use information we collect about you to communicate with you, provide the Services, comply with any applicable legal obligations, enforce any applicable terms of service, and to protect or defend the Services, our rights, and the rights of our users or others.`
    },
    {
      title: "What Personal Information We Collect",
      content: `The types of personal information we obtain about you depends on how you interact with our Site and use our Services. When we use the term "personal information," we are referring to information that identifies, relates to, describes, or can be associated with you.

Information We Collect Directly from You:
- Basic contact details including your name, address, phone number, email.
- Order information including your name, billing address, shipping address, payment confirmation, email address, phone number.
- Account information including your username, password, security questions.
- Shopping information including the items you view, put in your cart, or add to your wishlist.
- Customer support information including the information you choose to include in communications with us.`
    },
    {
      title: "Cookies and Information Collection",
      content: `We also automatically collect certain information about your interaction with the Services ("Usage Data"). To do this, we may use cookies, pixels, and similar technologies ("Cookies"). Usage Data may include information about how you access and use our Site and your account, including device information, browser information, information about your network connection, your IP address, and other information regarding your interaction with the Services.`
    },
    {
      title: "How We Use Your Personal Information",
      content: `Providing Products and Services:
We use your personal information to provide you with the Services in order to perform our contract with you, including to process your payments, fulfill your orders, to send notifications to you related to your account, purchases, returns, exchanges, or other transactions.

Marketing and Advertising:
We use your personal information for marketing and promotional purposes, such as to send marketing, advertising, and promotional communications by email, text message, or postal mail, and to show you advertisements for products or services.

Security and Fraud Prevention:
We use your personal information to detect, investigate, or take action regarding possible fraudulent, illegal, or malicious activity.`
    },
    {
      title: "Children's Data",
      content: `The Services are not intended to be used by children, and we do not knowingly collect any personal information about children. If you are the parent or guardian of a child who has provided us with their personal information, you may contact us using the contact details set out below to request that it be deleted.

As of the Effective Date of this Privacy Policy, we do not have actual knowledge that we "share" or "sell" (as those terms are defined in applicable law) personal information of individuals under 16 years of age.`
    }
  ]
</script>

<svelte:head>
  <title>Privacy Policy - BloxyFruit</title>
  <meta name="description" content="Read BloxyFruit's Privacy Policy to understand how we collect, use, and protect your personal information." />
</svelte:head>

<div class="flex flex-col items-center pt-[120px]">
  <!-- Background elements -->
  <div class="absolute top-[500px] left-[-250px] size-[250px] bg-[#3BA4F0]/50 blur-[250px]"></div>
  <!-- <div class="absolute top-[1200px] right-[-300px] size-[250px] bg-[#3BA4F0]/40 blur-[200px]"></div> -->

  <div class="max-w-[1000px] w-full flex justify-center flex-col px-4 sm:px-6">
    <h1 class="font-extrabold text-4xl md:text-5xl text-center mb-8">Privacy Policy</h1>

    <div class="prose prose-invert max-w-none">
      {#each sections as section}
        <section class="mb-12">
          <h2 class="text-2xl font-bold mb-4">{section.title}</h2>
          <div class="text-[#809BB5] space-y-4">
            {#each section.content.split('\n\n') as paragraph}
              <p class="font-medium">{paragraph}</p>
            {/each}
          </div>
        </section>
      {/each}

      <div class="mt-12 p-6 rounded-lg bg-[#1D2535]/45 backdrop-blur-sm">
        <h3 class="text-xl font-bold mb-3">Contact Information</h3>
        <p class="text-[#809BB5] font-medium">
          Should you have any questions about our privacy practices or this Privacy Policy, or if you would like to exercise any of the rights available to you, email us at 
          <a href="mailto:sepiandnahid@gmail.com" class="text-[#3BA4F0] hover:underline">sepiandnahid@gmail.com</a>
          or use our support chat.
        </p>
      </div>
    </div>
  </div>
</div>